import { useEffect, useState } from "react";
import { fetchAdminDashboardByExpert } from "../../services/api";

export default function ExpertProjectBoard() {
  const [items, setItems] = useState<
    Array<{ expertId: number | null; expertName: string | null; projectCount: number; inProgress: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetchAdminDashboardByExpert();
      if (res.success) setItems(res.data.items);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 24, color: "var(--c-text-3)" }}>加载中…</div>;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>公司项目看板（按专家）</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
          与班主任首页「按项目」统计不同，此处按专家聚合项目数量。
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "auto" }}>
        <table className="ant-table" style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <th>专家</th>
              <th>项目总数</th>
              <th>进行中</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: 24, color: "var(--c-text-3)" }}>
                  暂无数据
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={String(row.expertId ?? "none")}>
                  <td>{row.expertName || (row.expertId ? `专家#${row.expertId}` : "未分配专家")}</td>
                  <td>{row.projectCount}</td>
                  <td>{row.inProgress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
