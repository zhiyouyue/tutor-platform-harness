import { useCallback, useEffect, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../services/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<
    Array<{ id: number; title: string; body: string; readAt: string | null; createdAt: string }>
  >([]);

  const load = useCallback(async () => {
    const res = await fetchNotifications();
    if (res.success) setItems(res.data.items);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="ant-btn ant-btn-text"
        aria-label="站内通知"
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 18, lineHeight: 1, padding: "4px 8px" }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#ef4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 8,
            width: 320,
            maxHeight: 360,
            overflow: "auto",
            background: "#fff",
            border: "1px solid var(--c-border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            zIndex: 100,
          }}
        >
          <div style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid var(--c-border)" }}>
            站内通知
          </div>
          {items.length === 0 ? (
            <div style={{ padding: 16, color: "var(--c-text-3)", fontSize: 13 }}>暂无通知</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={async () => {
                  if (!n.readAt) await markNotificationRead(n.id);
                  await load();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  border: "none",
                  borderBottom: "1px solid var(--c-border)",
                  background: n.readAt ? "#fff" : "var(--c-primary-bg)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 4 }}>{n.body}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
