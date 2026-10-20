import { useState } from "react";

export default function StudentProfile() {
  const [notifications, setNotifications] = useState({ sessionReminder:true, messageAlert:true, progressUpdate:true, operationMessage:false });

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
      {/* Profile card */}
      <div style={{ borderRadius:16, padding:20, background:"linear-gradient(135deg, var(--c-blue-800), var(--c-blue-500))", color:"#fff", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800, flexShrink:0 }}>张</div>
        <div>
          <div style={{ fontSize:18, fontWeight:800 }}>张明远</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:3 }}>复旦大学 · 金融学 · 2027届</div>
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            <span style={{ background:"rgba(255,255,255,0.2)", fontSize:11, padding:"2px 10px", borderRadius:20 }}>辅导中</span>
            <span style={{ background:"rgba(255,255,255,0.2)", fontSize:11, padding:"2px 10px", borderRadius:20 }}>目标：产品经理</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>基本信息</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px,1fr))", gap:10 }}>
          {[["学校","复旦大学"],["专业","金融学"],["毕业年份","2027届"],["所在城市","上海"],["目标行业","互联网"],["目标岗位","产品经理"]].map(([l, v]) => (
            <div key={l} style={{ padding:"10px 12px", background:"var(--c-surface-2)", borderRadius:8, border:"1px solid var(--c-border)" }}>
              <div style={{ fontSize:11, color:"var(--c-text-3)", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>消息通知</div>
        {([ ["sessionReminder","辅导课程提醒"],["messageAlert","收到新消息"],["progressUpdate","项目进度更新"],["operationMessage","平台运营消息"] ] as [keyof typeof notifications, string][]).map(([key, label], i, arr) => (
          <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom: i < arr.length-1 ? "1px solid var(--c-border)" : "none" }}>
            <span style={{ fontSize:13 }}>{label}</span>
            <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))} style={{ width:36, height:20, borderRadius:10, border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", background: notifications[key] ? "var(--c-primary)" : "var(--c-border-2)" }}>
              <div style={{ position:"absolute", width:14, height:14, background:"#fff", borderRadius:"50%", top:3, left: notifications[key] ? "calc(100% - 17px)" : 3, transition:"left 0.2s", boxShadow:"0 1px 2px rgba(0,0,0,0.15)" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:18 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:8 }}>其他</div>
        {["账号安全","联系客服","意见反馈","隐私设置"].map((item, i, arr) => (
          <button key={item} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom: i < arr.length-1 ? "1px solid var(--c-border)" : "none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
            <span style={{ fontSize:13 }}>{item}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="var(--c-text-3)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        ))}
      </div>

      <button style={{ width:"100%", padding:"11px", border:"1px solid var(--c-danger-border, #FFA39E)", color:"var(--c-danger)", background:"transparent", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
        退出登录
      </button>
    </div>
  );
}
