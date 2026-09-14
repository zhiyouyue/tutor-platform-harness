import { useState } from "react";

export type ExpertPage = "dashboard"|"projects"|"delivery"|"capabilities"|"schedule"|"income"|"profile";

const nav: { id: ExpertPage; label: string; path: string }[] = [
  { id:"dashboard",    label:"工作台",    path:"M2 2h6v6H2zm8 0h6v6h-6zM2 10h6v6H2zm8 3h2m2 0h2m-3-3v2m0 2v2" },
  { id:"projects",     label:"我的项目",  path:"M3 5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" },
  { id:"delivery",     label:"交付空间",  path:"M2 13V5a2 2 0 012-2h10a2 2 0 012 2v8M2 13l3-3h8l3 3M6 7h6M6 10h3" },
  { id:"capabilities", label:"我的能力",  path:"M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 004.438 0 3.42 3.42 0 013.138 3.138 3.42 3.42 0 000 4.438 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 01-4.438 0 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 010-4.438 3.42 3.42 0 013.138-3.138z" },
  { id:"schedule",     label:"我的时间",  path:"M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zM2 8h16M6 2v3M10 2v3" },
  { id:"income",       label:"我的收入",  path:"M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM2 9h16M6 13h2M10 13h4" },
  { id:"profile",      label:"个人中心",  path:"M9 6a3 3 0 100-6 3 3 0 000 6zM3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" },
];

interface Props {
  page: ExpertPage;
  onNavigate: (p: ExpertPage) => void;
  onBack: () => void;
  children: React.ReactNode;
}

export default function ExpertLayout({ page, onNavigate, onBack, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 56 : 216,
        background: "#fff",
        borderRight: "1px solid var(--c-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: collapsed ? "0 16px" : "0 20px", gap: 10, borderBottom: "1px solid var(--c-border)", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ width: 32, height: 32, background: "var(--c-mentor-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1.5 4v4.5c0 3.5 2.8 6.8 6.5 7.5C11.7 15.3 14.5 12 14.5 8.5V4L8 1z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--c-text-1)", whiteSpace: "nowrap" }}>求职辅导</div>
              <div style={{ fontSize: 11, color: "var(--c-text-3)", whiteSpace: "nowrap" }}>专家工作台</div>
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
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: collapsed ? "9px 18px" : "9px 16px 9px 20px",
                  cursor: "pointer", userSelect: "none",
                  borderRight: active ? "2px solid var(--c-mentor-accent)" : "2px solid transparent",
                  background: active ? "#FFF4EE" : "transparent",
                  color: active ? "var(--c-mentor-accent)" : "var(--c-text-2)",
                  fontSize: 14, whiteSpace: "nowrap", overflow: "hidden",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--c-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-1)"; }}}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-2)"; }}}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                  <path d={item.path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--c-border)", padding: "12px 0", flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 10px 20px", overflow: "hidden" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-mentor-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>王</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-1)", whiteSpace: "nowrap" }}>王老师</div>
                <div style={{ fontSize: 11, color: "var(--c-success)", display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                  已认证
                </div>
              </div>
            </div>
          )}
          {[
            { label: "收起", icon: "M9 2L4 7l5 5", action: () => setCollapsed(c => !c), rotate: collapsed },
            { label: "切换角色", icon: "M6 2L1 7l5 5M1 7h12", action: onBack },
          ].map(b => (
            <div key={b.label}
              onClick={b.action}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 18px" : "8px 16px 8px 20px", cursor: "pointer", color: "var(--c-text-3)", fontSize: 13, whiteSpace: "nowrap" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--c-text-1)"; (e.currentTarget as HTMLElement).style.background = "var(--c-surface-2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--c-text-3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: b.rotate ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}>
                <path d={b.icon} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {!collapsed && <span>{b.label}</span>}
            </div>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, minWidth: 0, background: "var(--c-mentor-bg)", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
