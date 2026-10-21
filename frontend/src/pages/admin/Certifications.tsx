import { useCallback, useEffect, useState } from "react";
import {
  approveCertification,
  fetchPendingCertifications,
  rejectCertification,
} from "../../services/api";

type PendingCertification = {
  id: number;
  realName: string | null;
  account: string | null;
  currentTitle: string | null;
  city: string | null;
  submittedAt: string;
};

export default function Certifications() {
  const [items, setItems] = useState<PendingCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchPendingCertifications();
    if (res.success) {
      setItems(res.data.items as PendingCertification[]);
    } else {
      setError(res.message || "加载失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: number) {
    setBusyId(id);
    const res = await approveCertification(id);
    setBusyId(null);
    if (res.success) await load();
    else setError(res.message);
  }

  async function handleReject(id: number) {
    const reason = window.prompt("请输入拒绝原因");
    if (!reason?.trim()) return;
    setBusyId(id);
    const res = await rejectCertification(id, reason.trim());
    setBusyId(null);
    if (res.success) await load();
    else setError(res.message);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>专家认证</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>
          审核导师提交的认证申请，通过或拒绝并填写原因
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#FEF2F2", color: "#B91C1C", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--c-text-3)", fontSize: 14 }}>加载中…</div>
      ) : items.length === 0 ? (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px dashed var(--c-border-2)",
          padding: 48,
          textAlign: "center",
          color: "var(--c-text-3)",
        }}>
          暂无待审核申请
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid var(--c-border)",
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {item.realName || item.account || "未命名专家"}
                </div>
                <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
                  {item.currentTitle || "—"} · {item.city || "—"} · {item.account}
                </div>
                <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>
                  提交于 {new Date(item.submittedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleApprove(item.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--c-primary)",
                    color: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  通过
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleReject(item.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #FECACA",
                    background: "#fff",
                    color: "#B91C1C",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  拒绝
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
