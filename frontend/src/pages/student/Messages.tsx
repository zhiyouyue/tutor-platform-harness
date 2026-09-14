import { useState } from "react";

const C = "#0891B2";

const messages = [
  { from:"mentor",   name:"王老师",   time:"昨天 14:30", content:"同学你好，模拟面试前请复习一下STAR法则，准备2-3个核心案例，重点突出你在产品方向的项目经历。", avatar:"王" },
  { from:"me",       name:"张同学",   time:"昨天 15:00", content:"好的王老师，我整理了两个项目经历：一个是学生会的活动运营，一个是大创项目的产品设计，这样可以吗？", avatar:"张" },
  { from:"mentor",   name:"王老师",   time:"昨天 15:30", content:"很好！建议你在讲大创项目时，重点说用户调研、需求分析和产品迭代的过程，面试官最看重这部分。", avatar:"王" },
  { from:"super",    name:"李班主任", time:"今天 09:15", content:"张同学，提醒一下本周二晚上8点的模拟面试，记得提前10分钟进入会议室，有任何问题随时联系我。", avatar:"李" },
  { from:"me",       name:"张同学",   time:"今天 09:30", content:"好的李老师，我记住了！", avatar:"张" },
];

const avatarColors: Record<string,string> = { mentor:"#1677FF", super:"#7C3AED", me:C };

export default function StudentMessages() {
  const [input, setInput] = useState("");

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Contact tabs */}
      <div style={{ background:"#fff", borderBottom:"1px solid var(--c-border)", padding:"12px 16px" }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>消息</div>
        <div style={{ display:"flex", gap:10 }}>
          {[
            { name:"王老师", role:"导师", color:"#1677FF", unread:0 },
            { name:"李班主任", role:"班主任", color:"#7C3AED", unread:1 },
          ].map(c => (
            <button key={c.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"var(--c-surface-2)", borderRadius:10, border:"1px solid var(--c-border)", flex:1, cursor:"pointer" }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:c.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{c.name[0]}</div>
                {c.unread > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:14, height:14, background:"#F5222D", color:"#fff", borderRadius:"50%", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{c.unread}</div>}
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:12, fontWeight:600 }}>{c.name}</div>
                <div style={{ fontSize:11, color:"var(--c-text-3)" }}>{c.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-end", gap:8, flexDirection: msg.from === "me" ? "row-reverse" : "row" }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:avatarColors[msg.from] ?? C, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>
              {msg.avatar}
            </div>
            <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", gap:3, alignItems: msg.from === "me" ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize:10, color:"var(--c-text-3)" }}>
                {msg.from === "me" ? `${msg.time} · ${msg.name}` : `${msg.name} · ${msg.time}`}
              </div>
              <div style={{ padding:"9px 13px", borderRadius:12, fontSize:13, lineHeight:1.65, background: msg.from === "me" ? C : "#fff", color: msg.from === "me" ? "#fff" : "var(--c-text-1)", border: msg.from !== "me" ? "1px solid var(--c-border)" : "none", borderBottomRightRadius: msg.from === "me" ? 3 : 12, borderBottomLeftRadius: msg.from !== "me" ? 3 : 12 }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ background:"#fff", borderTop:"1px solid var(--c-border)", padding:"10px 14px", display:"flex", gap:10 }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="发送消息给导师或班主任…" style={{ flex:1, border:"1px solid var(--c-border-2)", borderRadius:10, padding:"9px 14px", fontSize:13, outline:"none", fontFamily:"inherit" }} onFocus={e => e.currentTarget.style.borderColor = C} onBlur={e => e.currentTarget.style.borderColor = "var(--c-border-2)"} />
        <button style={{ padding:"9px 18px", background:C, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>发送</button>
      </div>
    </div>
  );
}
