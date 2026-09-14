import { useEffect, useState } from "react";
import {
  acceptProject,
  fetchExpertDashboard,
  rejectProject,
  type Project,
} from "../../services/api";

interface Props { onNavigate: (p: string) => void; }

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", ...style }}>
      {children}
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export default function Dashboard({ onNavigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchExpertDashboard>>["data"] | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetchExpertDashboard();
    if (r.success) setData(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAccept(p: Project) {
    await acceptProject(p.id);
    load();
    onNavigate("projects");
  }

  async function handleReject(p: Project) {
    await rejectProject(p.id, "专家拒绝");
    load();
  }

  if (loading || !data) {
    return <div style={{ padding: 24, color: "var(--c-text-3)" }}>加载中…</div>;
  }

  const name = data.profile.realName || "专家";
  const firstPending = data.pendingProjects[0];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text-1)" }}>你好，{name} 👋</div>
          <div style={{ fontSize: 14, color: "var(--c-text-3)", marginTop: 4 }}>
            今日 {data.todayAppointments.length} 个辅导安排 · {data.stats.pendingConfirm} 个项目待确认
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF8F0", border: "1px solid #FFD591", borderRadius: 12, padding: "12px 20px" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--c-mentor-accent)" }}>{data.stats.inProgress}</div>
            <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>进行中项目</div>
          </div>
          <div style={{ width: 1, height: 32, background: "#FFD591" }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#722ED1" }}>{data.stats.uniqueStudents}</div>
            <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>累计学员</div>
          </div>
        </div>
      </div>

      {firstPending && (
        <div style={{ background: "#E6F4FF", border: "1px solid #91CAFF", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#003EB3" }}>新项目待确认</div>
            <div style={{ fontSize: 13, color: "#0958D9", marginTop: 2 }}>
              {firstPending.studentName || "学员"} · {firstPending.title} · ¥{firstPending.totalAmount}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="ant-btn ant-btn-primary" style={{ padding: "4px 16px", fontSize: 13 }} onClick={() => handleAccept(firstPending)}>接受</button>
            <button className="ant-btn ant-btn-default" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => handleReject(firstPending)}>拒绝</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>今日安排</span>
              <button style={{ fontSize: 13, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("schedule")}>查看日历 →</button>
            </div>
            <div style={{ padding: "8px 0" }}>
              {data.todayAppointments.length === 0 ? (
                <div style={{ padding: "16px 20px", fontSize: 13, color: "var(--c-text-3)" }}>今日暂无安排</div>
              ) : data.todayAppointments.map((s, i) => {
                const time = new Date(s.startAt as string).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
                const student = (s.studentName as string) || "学员";
                return (
                  <div key={s.id as number} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", borderBottom: i < data.todayAppointments.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                    <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600, width: 40 }}>{time}</span>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{student[0]}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{student}</span>
                      <span style={{ color: "var(--c-text-3)", fontSize: 13 }}> · {(s.topic as string) || (s.projectTitle as string)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--c-success)" }}>{STATUS_LABEL[s.status as string] || s.status as string}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>项目概览</span>
              <button style={{ fontSize: 13, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("projects")}>查看全部 →</button>
            </div>
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "进行中", n: data.stats.inProgress, color: "var(--c-primary)", bg: "var(--c-primary-bg)" },
                { label: "待确认", n: data.stats.pendingConfirm, color: "var(--c-warning)", bg: "#FFF7E6" },
                { label: "已完成", n: data.stats.completed, color: "var(--c-success)", bg: "#F6FFED" },
              ].map(s => (
                <button key={s.label} onClick={() => onNavigate("projects")} style={{ padding: "16px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: s.bg, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{s.label}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #0F1929 0%, #1A2D45 100%)", borderRadius: 12, padding: 20, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>收入概览</span>
              <button style={{ fontSize: 12, color: "#60A5FA", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("income")}>明细 →</button>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>¥{data.income.total.toLocaleString()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>待结算</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FA8C16" }}>¥{data.income.pending.toLocaleString()}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>已结算</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#60A5FA" }}>¥{data.income.settled.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
