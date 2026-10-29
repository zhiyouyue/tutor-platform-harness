import { useEffect, useState } from "react";
import { fetchStudentProjects, type Project } from "../../services/api";
import { labelCoachingNodeType, labelProjectStatus } from "../../utils/statusLabels";

export default function MyProject({ onOpenDelivery }: { onOpenDelivery?: (id: number) => void }) {
  const [items, setItems] = useState<Project[]>([]);

  useEffect(() => {
    fetchStudentProjects().then((r) => { if (r.success) setItems(r.data.items); });
  }, []);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>我的项目</div>
      {items.length === 0 ? (
        <div style={{ color: "var(--c-text-3)" }}>暂无项目</div>
      ) : items.map((p) => (
        <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
          <div style={{ fontWeight: 600 }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>{p.expertName} · {labelProjectStatus(p.status)}</div>
          {(p.nodes ?? []).length > 0 && (
            <div style={{ fontSize: 13, marginTop: 8 }}>
              辅导内容：{(p.nodes ?? []).map((node) => labelCoachingNodeType(node.nodeType, node.label)).join("、")}
            </div>
          )}
          {onOpenDelivery && (
            <button className="ant-btn ant-btn-primary" style={{ marginTop: 8 }} onClick={() => onOpenDelivery(p.id)}>进入交付空间</button>
          )}
        </div>
      ))}
    </div>
  );
}
