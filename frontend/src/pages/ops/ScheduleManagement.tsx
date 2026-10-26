import { useEffect, useState } from "react";
import {
  confirmOpsAppointmentCompletion,
  markOpsAppointmentIncomplete,
  fetchOpsAppointments,
  fetchOpsDashboard,
} from "../../services/api";
import { isoDate } from "./bookingMath";
import { appointmentStatusTagClass, labelAppointmentStatus } from "../../utils/statusLabels";
import ClassLinkField from "./ClassLinkField";

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface Props {
  onReschedule?: (projectId: number, focusIso: string) => void;
}

export default function ScheduleManagement({ onReschedule }: Props) {
  const [tab, setTab] = useState<"cal" | "avail" | "list">("list");
  const [appointments, setAppointments] = useState<Array<Record<string, unknown>>>([]);
  const [experts, setExperts] = useState<Array<{ expertId: number; realName: string | null; slotCount: number; acceptingProjects: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [apptRes, dashRes] = await Promise.all([
      fetchOpsAppointments(),
      fetchOpsDashboard(),
    ]);
    if (apptRes.success) setAppointments(apptRes.data.items);
    if (dashRes.success) setExperts(dashRes.data.expertAvailability);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const upcoming = appointments.filter((a) => new Date(a.startAt as string) >= new Date()).slice(0, 10);

  if (loading) {
    return <div style={{ padding: 24, color: "var(--c-text-3)" }}>加载中…</div>;
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>课程管理</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>共 {appointments.length} 条课次 · 复制上课链接发给学员，本阶段不发短信 · 改期回到项目课表拖动色块</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {(["list", "avail"] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? "ant-btn ant-btn-primary" : "ant-btn ant-btn-default"}
            onClick={() => setTab(t)}
          >
            {t === "list" ? "预约列表" : "专家档期"}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", overflow: "auto" }}>
          <table className="ant-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>学员</th><th>专家</th><th>项目</th><th>时间</th><th>主题</th><th>状态</th><th>上课链接</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--c-text-3)", padding: 24 }}>暂无课次</td></tr>
              ) : appointments.map((a) => (
                <tr key={a.id as number}>
                  <td>{(a.studentName as string) || "—"}</td>
                  <td>{(a.expertName as string) || "未分配"}</td>
                  <td>{(a.projectTitle as string) || "—"}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                    {new Date(a.startAt as string).toLocaleString("zh-CN")}
                  </td>
                  <td>{(a.topic as string) || "辅导"}</td>
                  <td><span className={appointmentStatusTagClass[a.status as string] || "ant-tag ant-tag-gray"}>{labelAppointmentStatus(a.status as string)}</span></td>
                  <td>
                    <ClassLinkField classPath={typeof a.classPath === "string" ? a.classPath : null} />
                  </td>
                  <td>
                    {Boolean(a.expertCompletedAt) && !Boolean(a.opsConfirmedAt) && (
                      <button
                        className="ant-btn ant-btn-link"
                        style={{ fontSize: 12 }}
                        onClick={async () => {
                          await confirmOpsAppointmentCompletion(a.id as number);
                          await load();
                        }}
                      >
                        确认完成
                      </button>
                    )}
                    {!["completed", "cancelled"].includes(a.status as string) && (
                      <>
                        <button
                          className="ant-btn ant-btn-link"
                          style={{ fontSize: 12 }}
                          onClick={() => {
                            const raw = String(a.startAt);
                            const date = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
                            onReschedule?.(Number(a.projectId), isoDate(date));
                          }}
                        >
                          改期
                        </button>
                        <button
                          className="ant-btn ant-btn-link"
                          style={{ fontSize: 12 }}
                          onClick={async () => {
                            const reason = prompt("未完成原因");
                            if (!reason?.trim()) return;
                            const fee = prompt("扣费金额（可选，数字）");
                            await markOpsAppointmentIncomplete(
                              a.id as number,
                              reason.trim(),
                              fee ? Number(fee) : undefined,
                            );
                            await load();
                          }}
                        >
                          未完成/扣费
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "avail" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {experts.length === 0 ? (
            <div style={{ color: "var(--c-text-3)" }}>暂无已认证专家</div>
          ) : experts.map((e) => (
            <div key={e.expertId} style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{e.realName || "未命名专家"}</div>
              <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>{e.slotCount} 个可辅导时段</div>
              <div style={{ fontSize: 12, marginTop: 8, color: e.acceptingProjects ? "var(--c-success)" : "var(--c-warning)" }}>
                {e.acceptingProjects ? "可接单" : "暂停接单"}
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>近期预约</div>
          {upcoming.map((a) => {
            const d = new Date(a.startAt as string);
            return (
              <div key={a.id as number} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--c-border)", fontSize: 13 }}>
                <span>{weekDays[d.getDay()]} {d.toLocaleString("zh-CN")}</span>
                <span>{(a.studentName as string) || "学员"} · {(a.expertName as string) || "专家"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
