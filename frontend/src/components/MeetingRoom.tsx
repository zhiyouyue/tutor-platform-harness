import { useEffect, useRef, useState } from "react";
import type { DingRTCClient, LocalTrack } from "dingrtc";
import { startSegmentArchive, type SegmentArchive } from "./classroomArchive";
import { attachTrack, joinFailureHint, patchDingRtcListenerCount, withTimeout } from "./dingrtcGuard";

export type ClassroomJoinInfo = {
  appId: string;
  channel: string;
  uid: string;
  token: string;
  userName?: string;
};

interface Props {
  joinInfo: ClassroomJoinInfo;
  appointmentId: number;
  onLeave: () => void;
}

type PlayableTrack = {
  play?: (element?: string | HTMLElement) => void;
  getMediaStreamTrack: () => MediaStreamTrack;
};

function splitMicAndCamera(tracks: LocalTrack[]): { mic: LocalTrack; cam: LocalTrack } {
  // dingrtc 实际返回 [CameraVideoTrack, MicrophoneAudioTrack]，勿按名解构 [mic, cam]
  const cam = tracks.find((t) => t.getMediaStreamTrack().kind === "video");
  const mic = tracks.find((t) => t.getMediaStreamTrack().kind === "audio");
  if (!cam || !mic) throw new Error("camera or microphone missing");
  return { mic, cam };
}

export default function MeetingRoom({ joinInfo, appointmentId, onLeave }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"devices" | "channel" | "live" | "error">("devices");
  const [hint, setHint] = useState("请在浏览器提示中允许摄像头和麦克风");
  const [micLevel, setMicLevel] = useState(0);
  const [needTapAudio, setNeedTapAudio] = useState(false);
  const pendingAudioPlay = useRef<Array<() => void>>([]);

  useEffect(() => {
    let client: DingRTCClient | null = null;
    let localTracks: LocalTrack[] = [];
    let disposed = false;
    let audioCtx: AudioContext | null = null;
    let meter: number | null = null;
    let archive: SegmentArchive | null = null;
    const remoteAudios: HTMLAudioElement[] = [];

    (async () => {
      try {
        const mod = await import("dingrtc");
        const DingRTC = mod.default;
        if (!DingRTC.checkSystemRequirements()) {
          setPhase("error");
          setHint("当前浏览器不支持在线课堂，请换用 Chrome 或 Edge。");
          return;
        }

        DingRTC.on?.("autoplay-failed", (track: PlayableTrack) => {
          pendingAudioPlay.current.push(() => track.play?.());
          setNeedTapAudio(true);
        });

        const created = await withTimeout(
          DingRTC.createMicrophoneAndCameraTracks({}, {}),
          20000,
          "camera permission timeout",
        );
        const { mic, cam } = splitMicAndCamera(created);
        if (disposed) {
          mic.close();
          cam.close();
          return;
        }
        localTracks = [mic, cam];
        if (localVideoRef.current) attachTrack(localVideoRef.current, cam.getMediaStreamTrack());
        const recordStream = new MediaStream([cam.getMediaStreamTrack(), mic.getMediaStreamTrack()]);
        archive = startSegmentArchive(appointmentId, recordStream);
        setPhase("channel");
        setHint("摄像头和麦克风已打开，正在连接课堂…");

        try {
          audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(new MediaStream([mic.getMediaStreamTrack()]));
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          const data = new Uint8Array(analyser.fftSize);
          void audioCtx.resume();
          meter = window.setInterval(() => {
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (const sample of data) {
              const centered = (sample - 128) / 128;
              sum += centered * centered;
            }
            setMicLevel(Math.min(1, Math.sqrt(sum / data.length) * 5));
          }, 120);
        } catch {
          setMicLevel(0.35);
        }

        client = DingRTC.createClient();
        patchDingRtcListenerCount(client);
        // DingRTC Web：音频只能订频道 MCU 合流一次，不能按个人 uid 订
        let mcuAudioSubscribed = false;

        const playRemoteAudio = (remoteAudio: PlayableTrack) => {
          try {
            remoteAudio.play?.();
            const track = remoteAudio.getMediaStreamTrack();
            archive?.addTrack(track);
            return;
          } catch {
            /* fall through to HTMLAudioElement */
          }
          const track = remoteAudio.getMediaStreamTrack();
          const audio = new Audio();
          audio.srcObject = new MediaStream([track]);
          remoteAudios.push(audio);
          void audio.play().then(
            () => undefined,
            () => {
              pendingAudioPlay.current.push(() => void audio.play());
              setNeedTapAudio(true);
            },
          );
          archive?.addTrack(track);
        };

        const playRemoteVideo = (remoteVideo: PlayableTrack) => {
          if (!remoteVideoRef.current) return;
          const track = remoteVideo.getMediaStreamTrack();
          attachTrack(remoteVideoRef.current, track);
          archive?.addTrack(track);
        };

        const subscribePublished = async (
          user: { userId: string },
          mediaType: string,
          auxiliary?: boolean,
        ) => {
          try {
            if (mediaType === "audio") {
              if (mcuAudioSubscribed) return;
              mcuAudioSubscribed = true;
              const track = (await client!.subscribe("mcu", "audio")) as PlayableTrack;
              if (disposed) return;
              playRemoteAudio(track);
              return;
            }
            if (mediaType === "video") {
              const track = (await client!.subscribe(user.userId, "video", auxiliary)) as PlayableTrack;
              if (disposed) return;
              playRemoteVideo(track);
            }
          } catch (err) {
            if (mediaType === "audio") mcuAudioSubscribed = false;
            console.error(err);
          }
        };

        client.on("user-published", (user, mediaType, auxiliary) => {
          void subscribePublished(user, mediaType, auxiliary);
        });

        await withTimeout(client.join({
          appId: joinInfo.appId,
          channel: joinInfo.channel,
          token: joinInfo.token,
          uid: joinInfo.uid,
          userName: joinInfo.userName || joinInfo.uid,
        }), 12000, "channelBind timeout");
        if (disposed) return;

        for (const user of client.remoteUsers ?? []) {
          if (user.hasVideo) void subscribePublished(user, "video");
          if (user.hasAudio) void subscribePublished(user, "audio");
        }

        await client.publish(localTracks);
        if (disposed) return;
        setPhase("live");
        setHint("已进入课堂");
      } catch (err) {
        if (disposed) return;
        setPhase("error");
        setHint(joinFailureHint(err));
        console.error(err);
      }
    })();

    return () => {
      disposed = true;
      archive?.stop();
      for (const audio of remoteAudios) {
        audio.pause();
        audio.srcObject = null;
      }
      if (meter != null) window.clearInterval(meter);
      void audioCtx?.close();
      for (const track of localTracks) {
        try {
          track.close();
        } catch {
          /* ignore */
        }
      }
      try {
        client?.leave();
      } catch {
        /* ignore */
      }
    };
  }, [appointmentId, joinInfo.appId, joinInfo.channel, joinInfo.token, joinInfo.uid, joinInfo.userName]);

  const unlockAudio = () => {
    for (const play of pendingAudioPlay.current.splice(0)) {
      try {
        play();
      } catch {
        /* ignore */
      }
    }
    setNeedTapAudio(false);
  };

  return (
    <div className="rtc-stage">
      <style>{`
        .rtc-stage { position: fixed; inset: 0; z-index: 40; background: #0b1220; display: flex; flex-direction: column; }
        .rtc-stage .rtc-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; }
        .rtc-stage .rtc-tile { position: relative; overflow: hidden; background: #0f172a; min-height: 0; }
        .rtc-stage video.rtc-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #0f172a; }
        .rtc-stage video.rtc-video.is-mirror { transform: scaleX(-1); }
      `}</style>
      <div className="rtc-grid">
        <div className="rtc-tile" aria-label="本地画面">
          <video ref={localVideoRef} className="rtc-video is-mirror" autoPlay muted playsInline />
          <TileLabel title="我" detail={phase === "devices" ? "正在打开设备" : "麦克风已打开"} />
          <div style={{ position: "absolute", left: 16, bottom: 16, zIndex: 2, width: 120, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.25)" }}>
            <div style={{ width: `${Math.round(micLevel * 100)}%`, height: "100%", borderRadius: 99, background: "#4ade80" }} />
          </div>
        </div>
        <div className="rtc-tile" aria-label="对方画面">
          <video ref={remoteVideoRef} className="rtc-video" autoPlay playsInline />
          <TileLabel title="对方" detail={phase === "live" ? "等待对方画面" : "尚未连上"} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", color: "#e2e8f0" }}>
        <span style={{ flex: 1, fontSize: 14 }}>{hint}</span>
        {needTapAudio && (
          <button type="button" onClick={unlockAudio} style={{ border: "none", background: "#16a34a", color: "#fff", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}>
            点击开启声音
          </button>
        )}
        <button type="button" onClick={onLeave} style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}>
          离开课堂
        </button>
      </div>
    </div>
  );
}

function TileLabel({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{ position: "absolute", left: 12, top: 12, zIndex: 2, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{detail}</div>
    </div>
  );
}
