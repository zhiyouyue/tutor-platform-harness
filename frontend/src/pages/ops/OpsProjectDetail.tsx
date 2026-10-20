import { useEffect, useState } from "react";
import {
  confirmProjectCompletion,
  fetchAppointments,
  fetchOpsExperts,
  fetchOpsProject,
  patchOpsProject,
  publishProject,
  type Project,
} from "../../services/api";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  pending_confirm: "待专家确认",
  in_progress: "进行中",
  pending_completion_review: "待完成审核",
  completed: "已完成",
  rejected: "已拒绝",
};

const APPT_STATUS: Record<string, string> = {
  scheduled: "已排期",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
  deferred: "已延期",
  incomplete: "未完成",
};

interface Props {
  projectId: number;
  onBack: () => void;
}

export default function OpsProjectDetail({ projectId, onBack }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [appointments, setAppointments] = useState<Array<Record<string, unknown>>>([]);
  const [experts, setExperts] = useState<Array<{ id: number; realName: string | null }>>([]);

  async function reload() {
    const [p, appt, exp] = await Promise.all([
      fetchOpsProject(projectId),
      fetchAppointments(projectId),
      fetchOpsExperts(),
    ]);
    if (p.success) setProject(p.data);
    if (appt.success) setAppointments(appt.data.items);
    if (exp.success) setExperts(exp.data.items);
  }

  useEffect(() => {
    reload();
  }, [projectId]);

  if (!project) {
    return <div style={{ padding: 24, color: "var(--c-text-3)" }}>加载中…</div>;
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <button type="button" className="ant-btn ant-btn-text" onClick={onBack}>
        ← 返回项目列表
      </button>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{project.title}</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
          学员 {project.studentName} · 专家 {project.expertName || "待指定"} · ¥{project.totalAmount} ·{" "}
          {STATUS_LABEL[project.status] || project.status}
        </div>
        <div style={{ fontSize: 12, color: "var(--c-text-4)", marginTop: 4 }}>项目编号 {project.projectNo}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {project.status === "draft" && (
          <button type="button" className="ant-btn ant-btn-primary" onClick={async () => { await publishProject(project.id); await reload(); }}>
            发布给专家
          </button>
        )}
        {project.status === "pending_completion_review" && (
          <button type="button" className="ant-btn ant-btn-primary" onClick={async () => { await confirmProjectCompletion(project.id); await reload(); }}>
            确认完成并入账
          </button>
        )}
        {["in_progress", "pending_confirm", "published"].includes(project.status) && (
          <button
            type="button"
            className="ant-btn ant-btn-default"
            onClick={async () => {
              const names = experts.map((e) => `${e.id}:${e.realName || "专家"}`).join("\n");
              const pick = prompt(`输入专家档案 ID\n${names}`, project.expertId ? String(project.expertId) : "");
              if (pick === null || !pick.trim()) return;
              const res = await patchOpsProject(project.id, { expertId: Number(pick.trim()) });
              if (!res.success) alert(res.message);
              await reload();
            }}
          >
            改派专家
          </button>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>课次（{appointments.length}）</div>
        {appointments.length === 0 ? (
          <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>暂无课次，请在「课程」中排课。</div>
        ) : (
          appointments.map((a) => (
            <div
              key={a.id as number}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--c-border)",
                fontSize: 13,
              }}
            >
              <div>
                <div>{(a.topic as string) || "辅导课"}</div>
                <div style={{ color: "var(--c-text-3)", marginTop: 2 }}>
                  {new Date(a.startAt as string).toLocaleString("zh-CN")}
                </div>
              </div>
              <span className="ant-tag ant-tag-blue">{APPT_STATUS[a.status as string] || (a.status as string)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
