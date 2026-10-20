import NotificationBell from "../../components/NotificationBell";

export type StudentPage = "dashboard"|"project"|"schedule"|"messages"|"profile";

const NAV: { id: StudentPage; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { id:"dashboard", label:"主页", icon: (a) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 9L10 2l7 7v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.5" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.12 : 0}/>
      <path d="M8 18V11h4v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id:"project", label:"辅导", icon: (a) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.12 : 0}/>
      <path d="M2 9h16M7 4V2M13 4V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M7 13l2 2 4-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id:"schedule", label:"预约", icon: (a) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.12 : 0}/>
      <path d="M10 6v4.5l3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )},
  { id:"messages", label:"消息", icon: (a) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 14V5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V14z" stroke="currentColor" strokeWidth="1.5" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.12 : 0}/>
    </svg>
  )},
  { id:"profile", label:"我的", icon: (a) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.12 : 0}/>
      <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
];

interface Props {
  page: StudentPage;
  onNavigate: (page: StudentPage) => void;
  onBack: () => void;
  children: React.ReactNode;
}

const C = "#0891B2";
const CB = "#ECFEFF";

export default function StudentLayout({ page, onNavigate, onBack, children }: Props) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", background:"#F5F7FA" }}>
      {/* Top header */}
      <header style={{ background:"#fff", borderBottom:"1px solid var(--c-border)", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 4v2.5c0 3.5 2.4 6.8 6 7.8 3.6-1 6-4.3 6-7.8V4L7 1z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15 }}>求职辅导</span>
          <span style={{ color:"var(--c-text-3)", fontSize:13 }}>· 学员中心</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <NotificationBell />
          <div style={{ width:30, height:30, borderRadius:"50%", background:CB, color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>张</div>
          <button onClick={onBack} style={{ fontSize:12, color:"var(--c-text-3)", background:"transparent", border:"none", cursor:"pointer" }}>切换角色</button>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex:1, minHeight:0, overflowY:"auto" }}>{children}</main>

      {/* Bottom nav */}
      <nav style={{ background:"#fff", borderTop:"1px solid var(--c-border)", display:"flex", flexShrink:0 }}>
        {NAV.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"8px 0 6px", gap:3,
              background:"transparent", border:"none", cursor:"pointer",
              color: active ? C : "var(--c-text-3)", transition:"color 0.15s",
            }}>
              {item.icon(active)}
              <span style={{ fontSize:10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
              {active && <div style={{ width:16, height:2, borderRadius:1, background:C }} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
