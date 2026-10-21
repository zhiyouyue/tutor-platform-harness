import { useState } from "react";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../contexts/AuthContext";

export type OpsPage = "dashboard" | "students" | "projects" | "schedule" | "finance";

const nav: { id: OpsPage; label: string; icon: string }[] = [
  { id: "dashboard", label: "首页",  icon: "M2 2h6v6H2V2zm8 0h6v6h-6V2zM2 10h6v6H2v-6zm8 3h2m2 0h2m-3-3v2m0 2v2" },
  { id: "students",  label: "学生",   icon: "M7 7a3 3 0 100-6 3 3 0 000 6zM1 16c0-3.3 2.7-6 6-6s6 2.7 6 6M13 7a2 2 0 100-4 2 2 0 000 4M15 14c.6.5 1 1.2 1 2" },
  { id: "projects",  label: "项目",   icon: "M3 5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" },
  { id: "schedule",  label: "课程",   icon: "M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zM2 8h16M6 2v3M10 2v3" },
  { id: "finance",   label: "收入",   icon: "M2 6h14v8H2V6zm2 10h10" },
];

const pageTitle: Record<OpsPage, string> = {
  dashboard: "首页",
  students: "学生",
  projects: "项目",
  schedule: "课程",
  finance: "收入",
};

function NavIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d={path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface Props {
  page: OpsPage;
  onNavigate: (p: OpsPage) => void;
  onBack: () => void;
  children: React.ReactNode;
}

export default function OpsLayout({ page, onNavigate, onBack, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const displayName = user?.account || user?.phone || "运营";
  const todayLabel = new Date().toLocaleDateString("zh-CN");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Dark sidebar */}
      <aside style={{
        width: collapsed ? 48 : 208,
        background: "var(--c-sidebar)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          height: 56,
          background: "var(--c-sidebar-2)",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 14px" : "0 20px",
          gap: 10,
          flexShrink: 0,
          overflow: "hidden",
        }}>
          <div style={{
            width: 28, height: 28,
            background: "var(--c-primary)",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 3.5v4c0 3.1 2.5 6 6 7 3.5-1 6-3.9 6-7v-4L7 1z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "var(--c-sidebar-text)", fontWeight: 600, fontSize: 14, lineHeight: 1.2, whiteSpace: "nowrap" }}>求职辅导平台</div>
              <div style={{ color: "var(--c-sidebar-muted)", fontSize: 11, whiteSpace: "nowrap" }}>管理后台</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto", overflowX: "hidden" }}>
          {nav.map(item => {
            const active = page === item.id;
            return (
              <div
                key={item.id}
                className="sidebar-item"
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  color: active ? "#fff" : "var(--c-sidebar-text)",
                  background: active ? "var(--c-sidebar-active)" : "transparent",
                  paddingLeft: collapsed ? 15 : 24,
                  paddingRight: collapsed ? 15 : 16,
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--c-sidebar-hover)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <NavIcon path={item.icon} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 10px", overflow: "hidden" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{displayName.slice(0, 1)}</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ color: "var(--c-sidebar-text)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{displayName}</div>
                <div style={{ color: "var(--c-sidebar-muted)", fontSize: 11, whiteSpace: "nowrap" }}>运营</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-item"
            style={{ color: "var(--c-sidebar-muted)", paddingLeft: collapsed ? 15 : 24, width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-sidebar-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-muted)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {!collapsed && <span style={{ fontSize: 13 }}>收起</span>}
          </button>
          <button
            type="button"
            onClick={onBack}
            title="退出登录"
            className="sidebar-item"
            style={{ color: "var(--c-sidebar-muted)", paddingLeft: collapsed ? 15 : 24, width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-sidebar-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--c-sidebar-muted)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 2L1 7l5 5M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {!collapsed && <span style={{ fontSize: 13 }}>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Right: header + content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top header */}
        <header style={{
          height: 56,
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          flexShrink: 0,
          gap: 8,
        }}>
          <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>管理后台</div>
          <div style={{ color: "var(--c-text-4)", fontSize: 12 }}>/</div>
          <div style={{ color: "var(--c-text-1)", fontSize: 13, fontWeight: 500 }}>{pageTitle[page]}</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NotificationBell />
            <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>{todayLabel}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "var(--c-surface-2)", borderRadius: 20, border: "1px solid var(--c-border)" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--c-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{displayName.slice(0, 1)}</div>
              <span style={{ fontSize: 13, color: "var(--c-text-1)", fontWeight: 500 }}>{displayName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "var(--c-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
