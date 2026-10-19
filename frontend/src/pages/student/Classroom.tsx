import { useEffect, useState } from "react";
import { joinClassroom } from "../../services/api";
import { PrimaryButton, SimpleCard, SimpleScreen } from "../../components/SimpleScreen";

interface Props {
  appointmentId: number;
  onBack: () => void;
}

export default function StudentClassroom({ appointmentId, onBack }: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [hint, setHint] = useState("");

  useEffect(() => {
    joinClassroom(appointmentId).then((res) => {
      if (res.success && res.data.ready) {
        setStatus("ready");
        setHint("课堂已准备好，请保持网络畅通。");
      } else {
        setStatus("unavailable");
        setHint(res.data?.message || res.message || "暂时无法进入在线课堂。");
      }
    });
  }, [appointmentId]);

  return (
    <SimpleScreen title="在线课堂" subtitle={status === "loading" ? "请稍候…" : undefined}>
      <SimpleCard>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--c-text-2)" }}>
          {status === "loading" ? "正在连接课堂…" : hint}
        </p>
        {status === "ready" && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--c-text-3)" }}>
            视频功能需在本机配置完成后自动开启。
          </p>
        )}
      </SimpleCard>
      <PrimaryButton onClick={onBack}>返回课程列表</PrimaryButton>
    </SimpleScreen>
  );
}
