export type AdminPage = "certifications" | "expertBoard";

const nav: { id: AdminPage; label: string }[] = [
  { id: "certifications", label: "专家认证" },
  { id: "expertBoard", label: "项目看板" },
];

interface Props {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onBack: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({ page, onNavigate, onBack, children }: Props) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <aside style={{
        width: 208,
        background: "var(--c-sidebar)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{
          height: 56,
          background: "var(--c-sidebar-2)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28,
            background: "#059669",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 3.5v4c0 3.1 2.5 6 6 7 3.5-1 6-3.9 6-7v-4L7 1z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "var(--c-sidebar-text)", fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>专家交付平台</div>
            <div style={{ color: "var(--c-sidebar-muted)", fontSize: 11 }}>管理员端</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 0" }}>
          {nav.map(item => {
            const active = page === item.id;
            return (
              <div
                key={item.id}
                className="sidebar-item"
                onClick={() => onNavigate(item.id)}
                style={{
                  color: active ? "#fff" : "var(--c-sidebar-text)",
                  background: active ? "var(--c-sidebar-active)" : "transparent",
                  paddingLeft: 24,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--c-sidebar-hover)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <button
            onClick={onBack}
            className="sidebar-item"
            style={{ color: "var(--c-sidebar-muted)", paddingLeft: 24, width: "100%", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-sidebar-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-muted)"; }}
          >
            切换角色
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          height: 56,
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          flexShrink: 0,
        }}>
          <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>管理员端</div>
          <div style={{ color: "var(--c-text-4)", fontSize: 12, margin: "0 8px" }}>/</div>
          <div style={{ color: "var(--c-text-1)", fontSize: 13, fontWeight: 500 }}>
            {nav.find(n => n.id === page)?.label}
          </div>
        </header>
        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "var(--c-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
