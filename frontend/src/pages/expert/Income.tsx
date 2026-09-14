import { useEffect, useState } from "react";
import { fetchIncomeSummary, fetchIncomeTransactions } from "../../services/api";

export default function Income() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, settled: 0 });
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetchIncomeSummary().then((r) => { if (r.success) setSummary(r.data); });
    fetchIncomeTransactions().then((r) => { if (r.success) setItems(r.data.items); });
  }, []);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的收入</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>账本只读 · 项目完成并经运营确认后入账</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[["累计", summary.total], ["待结算", summary.pending], ["已结算", summary.settled]].map(([l, v]) => (
          <div key={l as string} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>¥{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: 24, color: "var(--c-text-3)" }}>暂无收入记录</div>
        ) : items.map((row) => (
          <div key={row.id as number} style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between" }}>
            <span>{row.description as string || row.projectTitle as string}</span>
            <span>¥{row.amount as number} · {row.status as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
