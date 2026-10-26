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

export default function MeetingRoom({ joinInfo, appointmentId, onLeave }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"devices" | "channel" | "live" | "error">("devices");
  const [hint, setHint] = useState("请在浏览器提示中允许摄像头和麦克风");
  const [micLevel, setMicLevel] = useState(0);

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

        const [mic, cam] = await withTimeout(
          DingRTC.createMicrophoneAndCameraTracks({}, {}),
          20000,
          "camera permission timeout",
        );
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
        client.on("user-published", async (user, mediaType) => {
          try {
            await client!.subscribe(user.userId, mediaType);
          } catch (err) {
            console.error(err);
            return;
          }
          if (mediaType === "video" && user.videoTrack && remoteVideoRef.current) {
            const track = user.videoTrack.getMediaStreamTrack();
            attachTrack(remoteVideoRef.current, track);
            archive?.addTrack(track);
          }
          if (mediaType === "audio" && user.audioTrack) {
            const track = user.audioTrack.getMediaStreamTrack();
            const audio = new Audio();
            audio.srcObject = new MediaStream([track]);
            remoteAudios.push(audio);
            void audio.play().catch(() => undefined);
            archive?.addTrack(track);
          }
        });

        await withTimeout(client.join({
          appId: joinInfo.appId,
          channel: joinInfo.channel,
          token: joinInfo.token,
          uid: joinInfo.uid,
          userName: joinInfo.userName || joinInfo.uid,
        }), 12000, "channelBind timeout");
        if (disposed) return;
        await client.publish(localTracks);
        if (disposed) return;
        setPhase("live");
        setHint("已进入课堂，录像会分段保存");
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
