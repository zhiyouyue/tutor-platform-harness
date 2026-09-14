const C = "#0891B2";
const CB = "#ECFEFF";

const deliverables = [
  { name:"职业定位", status:"已完成", date:"09/05", file:"职业定位分析.pdf", color:"var(--c-success)" },
  { name:"简历优化", status:"已完成", date:"09/10", file:"简历v2.0.pdf",    color:"var(--c-success)" },
  { name:"模拟面试", status:"进行中", date:null,    file:null,              color:C },
  { name:"面试复盘", status:"待开始", date:null,    file:null,              color:"var(--c-text-3)" },
];

const records = [
  { date:"2025-09-10", type:"简历优化", summary:"优化了简历结构，增强实习经历的量化描述，突出了产品相关能力模块。王老师建议减少冗余内容，聚焦核心项目经历。", files:["简历v2.0.pdf"] },
  { date:"2025-09-05", type:"职业定位", summary:"通过深度访谈，明确了职业方向为互联网产品经理。分析了过往项目和能力，制定了初步的求职策略。", files:["职业定位分析.pdf"] },
];

export default function MyProject() {
  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <div style={{ fontSize:20, fontWeight:700 }}>我的辅导</div>
        <div style={{ fontSize:13, color:"var(--c-text-3)", marginTop:2 }}>秋招求职辅导项目详情</div>
      </div>

      {/* Progress */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>项目进度</div>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
            <span style={{ color:"var(--c-text-2)" }}>总进度</span>
            <span style={{ fontWeight:700, color:C, fontFamily:"'DM Mono',monospace" }}>60%</span>
          </div>
          <div style={{ height:8, background:"var(--c-surface-2)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:"60%", height:"100%", background:C, borderRadius:4 }} />
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {deliverables.map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--c-surface-2)", borderRadius:8, border:"1px solid var(--c-border)" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:d.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {d.status === "已完成" ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l2.5 2.5L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : d.status === "进行中" ? (
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }} />
                ) : (
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.4)" }} />
                )}
              </div>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:14, fontWeight:500 }}>{d.name}</span>
                {d.date && <span style={{ fontSize:12, color:"var(--c-text-3)", marginLeft:6 }}>· {d.date}</span>}
              </div>
              <span style={{ fontSize:12, padding:"2px 10px", borderRadius:20, fontWeight:600, background: d.status === "已完成" ? "#F6FFED" : d.status === "进行中" ? CB : "var(--c-surface-2)", color: d.status === "已完成" ? "var(--c-success)" : d.status === "进行中" ? C : "var(--c-text-3)" }}>
                {d.status}
              </span>
              {d.file && <button style={{ fontSize:12, color:C, background:"transparent", border:"none", cursor:"pointer", flexShrink:0 }}>查看文件</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Records */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>辅导记录</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {records.map((r, i) => (
            <div key={i} style={{ padding:"14px 16px", borderRadius:10, border:"1px solid var(--c-border)", background:"var(--c-surface-2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:12, padding:"2px 10px", borderRadius:20, background:CB, color:C, fontWeight:600 }}>{r.type}</span>
                <span style={{ fontSize:12, color:"var(--c-text-3)", fontFamily:"'DM Mono',monospace" }}>{r.date}</span>
              </div>
              <p style={{ margin:0, fontSize:13, color:"var(--c-text-2)", lineHeight:1.7 }}>{r.summary}</p>
              {r.files.length > 0 && (
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  {r.files.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1px solid var(--c-border)", borderRadius:6, padding:"4px 10px", fontSize:12, color:"var(--c-text-2)" }}>
                      📎 {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
