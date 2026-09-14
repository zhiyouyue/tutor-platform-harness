import type { StudentPage } from "./StudentLayout";

const C = "#0891B2";
const CB = "#ECFEFF";

interface Props {
  onNavigate: (page: StudentPage) => void;
}

const nodes = [
  { label:"职业定位",  done:true,  active:false, date:"09/05" },
  { label:"简历优化",  done:true,  active:false, date:"09/10" },
  { label:"模拟面试",  done:false, active:true },
  { label:"面试复盘",  done:false, active:false },
  { label:"完成",      done:false, active:false },
];

export default function StudentDashboard({ onNavigate }: Props) {
  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
      {/* Greeting */}
      <div>
        <div style={{ fontSize:12, color:"var(--c-text-3)" }}>2026年9月14日 · 周一</div>
        <div style={{ fontSize:22, fontWeight:800, marginTop:4 }}>你好，张同学 👋</div>
        <div style={{ fontSize:13, color:"var(--c-text-2)", marginTop:2 }}>秋招求职辅导进行中，加油！</div>
      </div>

      {/* Main project card */}
      <div style={{ borderRadius:16, padding:20, background:`linear-gradient(135deg, ${C}, #0E7490)`, color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>当前辅导项目</div>
            <div style={{ fontSize:18, fontWeight:800 }}>秋招求职辅导</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:3 }}>导师：王老师 · 复旦大学 金融</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:32, fontWeight:900, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>60%</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>项目进度</div>
          </div>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.2)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:"60%", height:"100%", background:"#fff", borderRadius:3 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:6 }}>
          <span>已完成：职业定位、简历优化</span>
          <span>下一步：模拟面试</span>
        </div>
      </div>

      {/* Next session alert */}
      <div style={{ background:"#FFFBE6", border:"1px solid #FFD591", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"#FAAD14", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="white" strokeWidth="1.3"/>
            <path d="M2 7h12M5 1.5v3M11 1.5v3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, color:"#874D00", fontSize:13 }}>下次辅导即将开始</div>
          <div style={{ fontSize:12, color:"#AD6800", marginTop:2 }}>09/16 (周二) 20:00 · 模拟面试 · 王老师</div>
        </div>
        <button onClick={() => onNavigate("schedule")} style={{ padding:"5px 12px", background:"#FAAD14", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>查看</button>
      </div>

      {/* 2-col grid for nodes + mentor */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:14 }}>
        {/* Nodes */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:600, fontSize:14 }}>辅导节点</span>
            <button onClick={() => onNavigate("project")} style={{ fontSize:12, color:C, background:"transparent", border:"none", cursor:"pointer" }}>详情 →</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {nodes.map((n, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: n.done ? C : n.active ? CB : "var(--c-surface-2)", border:`2px solid ${n.done ? C : n.active ? C : "var(--c-border-2)"}` }}>
                  {n.done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : n.active ? (
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C }} />
                  ) : null}
                </div>
                <span style={{ flex:1, fontSize:13, fontWeight: n.active ? 600 : 400, color: n.done ? "var(--c-text-1)" : n.active ? C : "var(--c-text-3)" }}>{n.label}</span>
                {n.done && <span style={{ fontSize:11, color:"var(--c-text-3)" }}>✓ {n.date}</span>}
                {n.active && <span style={{ fontSize:11, fontWeight:600, color:C }}>进行中</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Mentor card */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>我的导师</div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:12, background:CB, color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, flexShrink:0 }}>王</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>王老师</div>
              <div style={{ fontSize:12, color:"var(--c-text-2)", marginTop:2 }}>高级产品经理 · 8年经验</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
                {["互联网","应届生","产品","面试"].map(t => (
                  <span key={t} style={{ fontSize:11, background:"var(--c-surface-2)", color:"var(--c-text-2)", padding:"2px 8px", borderRadius:20 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate("messages")} style={{ width:"100%", padding:"8px", background:C, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            发消息给王老师
          </button>
        </div>
      </div>
    </div>
  );
}
