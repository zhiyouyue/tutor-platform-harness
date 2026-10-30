import { useEffect, useState } from "react";
import { acceptProject, fetchProjects, rejectProject, type Project } from "../../services/api";
import { askText } from "../../components/uiDialog";
import { labelProjectStatus } from "../../utils/statusLabels";

type Tab = "pending" | "active" | "completed";

const tabStatus: Record<Tab, string[]> = {
  pending: ["pending_confirm"],
  active: ["in_progress", "pending_completion_review"],
  completed: ["completed", "rejected", "cancelled"],
};

export default function Projects({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>("active");
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProjects().then((res) => {
      if (res.success) setItems(res.data.items);
      setLoading(false);
    });
  }, [tab]);

  const rows = items.filter((p) => tabStatus[tab].includes(p.status));

  async function handleAccept(id: number) {
    await acceptProject(id);
    const res = await fetchProjects();
    if (res.success) setItems(res.data.items);
  }

  async function handleReject(id: number) {
    const reason = await askText({
      title: "拒绝项目",
      label: "拒绝原因",
      placeholder: "请说明拒绝原因",
      defaultValue: "暂不接此项目",
      required: true,
    });
    if (reason === null) return;
    await rejectProject(id, reason.trim() || "暂不接此项目");
    const res = await fetchProjects();
    if (res.success) setItems(res.data.items);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的项目</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>共 {rows.length} 个项目</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["pending", "active", "completed"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="ant-btn ant-btn-default">
            {t === "pending" ? "待确认" : t === "active" ? "进行中" : "已完成"}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: "var(--c-text-3)" }}>加载中…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "var(--c-text-3)" }}>暂无项目</div>
      ) : (
        rows.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
              {p.studentName} · ¥{p.totalAmount} · {labelProjectStatus(p.status)}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="ant-btn ant-btn-primary" onClick={() => onSelectProject(String(p.id))}>详情</button>
              {p.status === "pending_confirm" && (
                <>
                  <button className="ant-btn ant-btn-default" onClick={() => handleAccept(p.id)}>接受</button>
                  <button className="ant-btn ant-btn-default" onClick={() => handleReject(p.id)}>拒绝</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
