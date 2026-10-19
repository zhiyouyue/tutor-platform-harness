import { useEffect, useRef, useState } from "react";
import type { DingRTCClient, LocalTrack } from "dingrtc";
import { PrimaryButton, SimpleCard } from "./SimpleScreen";

export type ClassroomJoinInfo = {
  appId: string;
  channel: string;
  uid: string;
  token: string;
  userName?: string;
};

interface Props {
  joinInfo: ClassroomJoinInfo;
  onLeave: () => void;
}

export default function MeetingRoom({ joinInfo, onLeave }: Props) {
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [errorHint, setErrorHint] = useState("");

  useEffect(() => {
    let client: DingRTCClient | null = null;
    let localTracks: LocalTrack[] = [];
    let disposed = false;

    (async () => {
      try {
        const mod = await import("dingrtc");
        const DingRTC = mod.default;
        if (!DingRTC.checkSystemRequirements()) {
          setStatus("error");
          setErrorHint("当前浏览器不支持在线课堂，请换用 Chrome 或 Edge。");
          return;
        }
        client = DingRTC.createClient();
        await client.join({
          appId: joinInfo.appId,
          channel: joinInfo.channel,
          token: joinInfo.token,
          uid: joinInfo.uid,
          userName: joinInfo.userName || joinInfo.uid,
        });
        if (disposed) return;

        const [mic, cam] = await DingRTC.createMicrophoneAndCameraTracks({}, {});
        localTracks = [mic, cam];
        await client.publish(localTracks);
        if (localRef.current) cam.play(localRef.current);

        client.on("user-published", async (user, mediaType) => {
          await client!.subscribe(user.userId, mediaType);
          if (mediaType === "video" && user.videoTrack && remoteRef.current) {
            user.videoTrack.play(remoteRef.current);
          }
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        });

        setStatus("live");
      } catch (e) {
        if (disposed) return;
        setStatus("error");
        setErrorHint("无法进入课堂，请检查网络或稍后再试。");
        console.error(e);
      }
    })();

    return () => {
      disposed = true;
      for (const t of localTracks) {
        try {
          t.close();
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
  }, [joinInfo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SimpleCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minHeight: 200 }}>
          <div
            ref={localRef}
            style={{ background: "#0f172a", borderRadius: 8, minHeight: 180 }}
            aria-label="本地画面"
          />
          <div
            ref={remoteRef}
            style={{ background: "#1e293b", borderRadius: 8, minHeight: 180 }}
            aria-label="对方画面"
          />
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--c-text-2)" }}>
          {status === "connecting" && "正在连接…"}
          {status === "live" && "课堂进行中"}
          {status === "error" && errorHint}
        </p>
      </SimpleCard>
      <PrimaryButton onClick={onLeave}>离开课堂</PrimaryButton>
    </div>
  );
}
