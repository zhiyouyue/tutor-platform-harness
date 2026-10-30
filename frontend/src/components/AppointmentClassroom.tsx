import { useEffect, useState } from "react";
import { fetchAppointmentRecordings, joinClassroom } from "../services/api";
import MeetingRoom, { type ClassroomJoinInfo } from "./MeetingRoom";
import { PrimaryButton, SimpleCard, SimpleScreen } from "./SimpleScreen";

interface Props {
  appointmentId: number;
  onBack: () => void;
}

export default function AppointmentClassroom({ appointmentId, onBack }: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [hint, setHint] = useState("");
  const [joinInfo, setJoinInfo] = useState<ClassroomJoinInfo | null>(null);
  const [recordings, setRecordings] = useState<Array<{ ossKey: string; durationSec?: number | null }>>([]);

  useEffect(() => {
    joinClassroom(appointmentId).then((res) => {
      if (res.success && res.data.ready && res.data.joinInfo) {
        const j = res.data.joinInfo as Record<string, unknown>;
        setJoinInfo({
          appId: String(j.appId),
          channel: String(j.channel),
          uid: String(j.uid),
          token: String(j.token),
          userName: j.userName ? String(j.userName) : undefined,
        });
        setStatus("ready");
      } else {
        setStatus("unavailable");
        setHint(res.data?.message || res.message || "暂时无法进入在线课堂。");
      }
    });
    fetchAppointmentRecordings(appointmentId).then((res) => {
      if (res.success) setRecordings(res.data.items);
    });
  }, [appointmentId]);

  if (status === "ready" && joinInfo) {
    return (
      <SimpleScreen title="在线课堂" subtitle="请允许使用摄像头和麦克风">
        <MeetingRoom joinInfo={joinInfo} appointmentId={appointmentId} onLeave={onBack} />
      </SimpleScreen>
    );
  }

  return (
    <SimpleScreen title="在线课堂" subtitle={status === "loading" ? "请稍候…" : undefined}>
      <SimpleCard>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--c-text-2)" }}>
          {status === "loading" ? "正在连接课堂…" : hint}
        </p>
      </SimpleCard>
      {recordings.length > 0 && (
        <SimpleCard>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>课程回放</div>
          {recordings.map((r) => (
            <div key={r.ossKey} style={{ fontSize: 13, color: "var(--c-text-2)" }}>
              回放{r.durationSec ? ` · ${Math.round(r.durationSec / 60)} 分钟` : ""}
            </div>
          ))}
        </SimpleCard>
      )}
      <PrimaryButton onClick={onBack}>返回</PrimaryButton>
    </SimpleScreen>
  );
}
