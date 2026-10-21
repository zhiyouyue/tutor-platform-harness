import { useEffect, useState } from "react";
import { fetchOpsDashboard, type Project } from "../../services/api";
import type { OpsPage } from "./OpsLayout";
import { labelProjectStatus, projectStatusTagClass } from "../../utils/statusLabels";

interface StatCardProps {
  label: string;
  value: string;
  daily?: string;
  dailyLabel?: string;
}
function StatCard({ label, value, daily, dailyLabel }: StatCardProps) {
  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", padding: "20px 24px", minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "var(--c-text-2)" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-text-1)", letterSpacing: "-0.5px", lineHeight: 1.2, margin: "8px 0 12px" }}>{value}</div>
      {daily && (
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--c-text-3)" }}>
          {dailyLabel ?? "今日"}: <span style={{ color: "var(--c-text-2)" }}>{daily}</span>
        </div>
      )}
    </div>
  );
}

export default function OpsDashboard({ onNavigate }: { onNavigate: (p: OpsPage) => void }) {
  const [dash, setDash] = useState<Awaited<ReturnType<typeof fetchOpsDashboard>>["data"] | null>(null);

  useEffect(() => {
    fetchOpsDashboard().then((r) => { if (r.success) setDash(r.data); });
  }, []);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100%" }}>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard
          label="活跃项目"
          value={String(dash?.stats.activeProjects ?? "—")}
        />
        <StatCard
          label="学员总数"
          value={String(dash?.stats.totalStudents ?? "—")}
        />
        <StatCard
          label="可接单专家"
          value={String(dash?.expertAvailability.filter(e => e.acceptingProjects).length ?? "—")}
        />
        <StatCard
          label="本周预约"
          value={String(dash?.stats.weekAppointments ?? "—")}
          daily={String(dash?.stats.pendingCompletionReview ?? 0)} dailyLabel="待验收"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
        {/* Mentor ranking */}
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", fontSize: 15, fontWeight: 600 }}>专家档期概览</div>
          <div style={{ padding: "0 24px" }}>
            {(dash?.expertAvailability ?? []).map((r, i, arr) => (
              <div key={r.expertId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: i === 0 ? "#FFC53D" : i === 1 ? "#D9D9D9" : i === 2 ? "#FA8C16" : "transparent",
                  color: i < 3 ? "#fff" : "var(--c-text-3)",
                  border: i >= 3 ? "1px solid var(--c-border)" : "none",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text-1)" }}>{r.realName || "未命名"}</div>
                  <div style={{ height: 4, background: "var(--c-border)", borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: "100%", background: i === 0 ? "var(--c-primary)" : "var(--c-text-4)", borderRadius: 2, width: `${Math.min(100, r.slotCount * 10)}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-1)" }}>{r.slotCount} 时段</div>
                  <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>{r.acceptingProjects ? "可接单" : "暂停"}</div>
                </div>
              </div>
            ))}
            {!dash?.expertAvailability.length && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--c-text-3)", fontSize: 13 }}>暂无专家档期数据</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent projects table ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>近期项目</span>
          <button className="ant-btn ant-btn-text" style={{ fontSize: 13 }} onClick={() => onNavigate("projects")}>
            查看全部 →
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ant-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>学员</th><th>专家</th><th>项目</th><th>金额</th><th>状态</th>
              </tr>
            </thead>
            <tbody>
              {(dash?.recentProjects ?? []).map((p: Project) => (
                <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("projects")}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                        {(p.studentName || "?")[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.studentName || "—"}</span>
                    </div>
                  </td>
                  <td style={{ color: !p.expertName ? "var(--c-danger)" : "var(--c-text-2)" }}>{p.expertName || "未分配"}</td>
                  <td>{p.title}</td>
                  <td style={{ fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>¥{p.totalAmount}</td>
                  <td><span className={projectStatusTagClass[p.status] ?? "ant-tag ant-tag-gray"}>{labelProjectStatus(p.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Alerts row ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", fontSize: 15, fontWeight: 600 }}>
          待处理事项
          <span style={{ marginLeft: 8, padding: "0 6px", background: "var(--c-danger)", color: "#fff", borderRadius: 10, fontSize: 12 }}>{dash?.stats.pendingCompletionReview ?? 0}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ant-table">
            <thead><tr><th>学员</th><th>负责导师</th><th>问题描述</th><th>紧急度</th><th>操作</th></tr></thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ color: "var(--c-text-3)" }}>
                  {(dash?.stats.pendingCompletionReview ?? 0) > 0
                    ? `有 ${dash?.stats.pendingCompletionReview} 个项目待验收，请到项目列表处理`
                    : "暂无待处理事项"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
