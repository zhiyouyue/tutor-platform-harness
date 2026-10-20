import { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../../services/api";
import { PrimaryButton, SimpleCard, SimpleScreen } from "../../components/SimpleScreen";

type SessionRow = {
  id: number;
  topic: string;
  expertName?: string;
  startAt: string;
  statusLabel: string;
  upcoming: boolean;
};

interface Props {
  onEnterClassroom?: (appointmentId: number) => void;
}

export default function StudentSchedule({ onEnterClassroom }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentAppointments().then((res) => {
      if (res.success) {
        const now = Date.now();
        setSessions(
          res.data.items.map((a) => {
            const statusLabel = (a.statusLabel as string) || "待确认";
            const done = statusLabel === "已完成";
            const upcoming = !done && new Date(a.startAt as string).getTime() >= now;
            return {
              id: a.id as number,
              topic: (a.topic as string) || "辅导课",
              expertName: a.expertName as string | undefined,
              startAt: a.startAt as string,
              statusLabel,
              upcoming,
            };
          }),
        );
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <SimpleScreen title="我的课程"><p style={{ color: "var(--c-text-3)" }}>加载中…</p></SimpleScreen>;
  }

  const upcomingLabels = new Set(["即将上课", "进行中", "待上课"]);
  const upcoming = sessions.filter((s) => upcomingLabels.has(s.statusLabel));
  const past = sessions.filter((s) => !upcomingLabels.has(s.statusLabel));

  return (
    <SimpleScreen title="我的课程" subtitle="上课时间与状态">
      {sessions.length === 0 && (
        <SimpleCard><p style={{ margin: 0, color: "var(--c-text-2)" }}>还没有课程，请联系班主任。</p></SimpleCard>
      )}
      {upcoming.map((s) => (
        <SimpleCard key={s.id}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{s.topic}</div>
          <div style={{ fontSize: 14, color: "var(--c-text-2)", marginTop: 6 }}>
            {new Date(s.startAt).toLocaleString("zh-CN")}
            {s.expertName ? ` · ${s.expertName}` : ""}
          </div>
          <div style={{ fontSize: 13, color: "var(--c-primary)", marginTop: 6 }}>{s.statusLabel}</div>
          {onEnterClassroom && ["即将上课", "进行中", "待上课"].includes(s.statusLabel) && (
            <div style={{ marginTop: 14 }}>
              <PrimaryButton onClick={() => onEnterClassroom(s.id)}>进入课堂</PrimaryButton>
            </div>
          )}
        </SimpleCard>
      ))}
      {past.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 8 }}>历史课次</div>
          {past.map((s) => (
            <SimpleCard key={s.id}>
              <div style={{ fontWeight: 500 }}>{s.topic}</div>
              <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
                {new Date(s.startAt).toLocaleDateString("zh-CN")} · {s.statusLabel}
              </div>
            </SimpleCard>
          ))}
        </>
      )}
    </SimpleScreen>
  );
}
