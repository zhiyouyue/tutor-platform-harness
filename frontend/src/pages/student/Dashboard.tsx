import { useEffect, useState } from "react";
import type { StudentPage } from "./StudentLayout";
import { fetchStudentAppointments, fetchStudentProjects, type Project } from "../../services/api";
import { PrimaryButton, SimpleCard, SimpleScreen } from "../../components/SimpleScreen";

interface Props {
  onNavigate: (page: StudentPage) => void;
}

export default function StudentDashboard({ onNavigate }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [nextLabel, setNextLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStudentProjects(), fetchStudentAppointments()]).then(([pRes, aRes]) => {
      if (pRes.success && pRes.data.items.length) setProject(pRes.data.items[0]!);
      if (aRes.success) {
        const upcoming = aRes.data.items
          .filter((a) => !a.opsConfirmedAt && new Date(a.startAt as string) >= new Date())
          .sort((a, b) => new Date(a.startAt as string).getTime() - new Date(b.startAt as string).getTime());
        const first = upcoming[0];
        if (first) {
          const d = new Date(first.startAt as string);
          setNextLabel(
            `${d.toLocaleDateString("zh-CN")} ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} · ${(first.topic as string) || "辅导课"}`,
          );
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <SimpleScreen title="首页"><p style={{ color: "var(--c-text-3)" }}>加载中…</p></SimpleScreen>;
  }

  return (
    <SimpleScreen title="你好" subtitle="这里是你的辅导安排">
      <SimpleCard>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 6 }}>当前项目</div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{project?.title || "暂无项目"}</div>
        {project?.expertName && (
          <div style={{ fontSize: 14, color: "var(--c-text-2)", marginTop: 8 }}>导师：{project.expertName}</div>
        )}
      </SimpleCard>

      {nextLabel ? (
        <SimpleCard>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 6 }}>下一节课</div>
          <div style={{ fontSize: 15 }}>{nextLabel}</div>
          <div style={{ marginTop: 14 }}>
            <PrimaryButton onClick={() => onNavigate("schedule")}>查看课程</PrimaryButton>
          </div>
        </SimpleCard>
      ) : (
        <SimpleCard>
          <p style={{ margin: 0, fontSize: 14, color: "var(--c-text-2)" }}>暂无待上课程。有问题请联系班主任。</p>
        </SimpleCard>
      )}
    </SimpleScreen>
  );
}
