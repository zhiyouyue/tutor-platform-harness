import { useState } from "react";

type SpaceTab = "messages"|"files"|"meeting";

const messages = [
  { from:"super", name:"李班主任", time:"09:30", content:"王老师，张同学这周五想约个模拟面试，您方便吗？" },
  { from:"me",    name:"王老师",   time:"09:45", content:"可以的，周五下午3点或晚上8点都OK，让同学选择一下" },
  { from:"super", name:"李班主任", time:"10:02", content:"好的，已通知张同学，他选了晚上8点，稍后确认" },
  { from:"me",    name:"王老师",   time:"10:15", content:"收到，那我准备一下面试题目，主要针对产品经理方向" },
  { from:"super", name:"李班主任", time:"14:22", content:"已确认，周五20:00 模拟面试，会议链接稍后发给您" },
];

const files = [
  { name:"张同学-原始简历.pdf",    size:"2.3 MB", type:"pdf", date:"09/01", uploader:"李班主任" },
  { name:"简历优化版v1.0.docx",    size:"1.8 MB", type:"doc", date:"09/08", uploader:"王老师" },
  { name:"简历优化版v2.0.pdf",     size:"2.1 MB", type:"pdf", date:"09/10", uploader:"王老师" },
  { name:"职业定位分析报告.pdf",   size:"3.4 MB", type:"pdf", date:"09/05", uploader:"王老师" },
  { name:"面试题目准备清单.docx",  size:"0.9 MB", type:"doc", date:"09/13", uploader:"王老师" },
];

const meetings = [
  { title:"模拟面试", date:"2025-09-16", time:"20:00", duration:"60分钟", status:"待开始", link:"https://meeting.example.com/xxx" },
  { title:"简历优化", date:"2025-09-10", time:"19:30", duration:"60分钟", status:"已完成", link:null },
  { title:"职业定位", date:"2025-09-05", time:"20:00", duration:"90分钟", status:"已完成", link:null },
];

const ST: Record<string,string> = { "待开始":"ant-tag ant-tag-orange","已完成":"ant-tag ant-tag-green","已确认":"ant-tag ant-tag-blue" };

export default function DeliverySpace() {
  const [tab, setTab] = useState<SpaceTab>("messages");
  const [input, setInput] = useState("");

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>交付空间</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>张</div>
          张同学｜秋招求职辅导
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>
        {([["messages","💬 消息"],["files","📁 文件"],["meeting","📹 会议"]] as [SpaceTab,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", fontSize: 14, cursor: "pointer", background: "transparent", border: "none",
            borderBottom: tab === id ? "2px solid var(--c-mentor-accent)" : "2px solid transparent",
            color: tab === id ? "var(--c-mentor-accent)" : "var(--c-text-2)",
            fontWeight: tab === id ? 600 : 400, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "messages" && (
        <div style={{ flex: 1, minHeight: 0, background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10, flexDirection: msg.from === "me" ? "row-reverse" : "row" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: msg.from === "me" ? "var(--c-mentor-accent)" : "var(--c-purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {msg.name[0]}
                </div>
                <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", gap: 3, alignItems: msg.from === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>{msg.name} · {msg.time}</div>
                  <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, lineHeight: 1.6, background: msg.from === "me" ? "var(--c-mentor-accent)" : "var(--c-surface-2)", color: msg.from === "me" ? "#fff" : "var(--c-text-1)", borderBottomRightRadius: msg.from === "me" ? 3 : 10, borderBottomLeftRadius: msg.from !== "me" ? 3 : 10 }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 10 }}>
            <input className="ant-input" value={input} onChange={e => setInput(e.target.value)} placeholder="输入消息…" style={{ flex: 1 }} />
            <button className="ant-btn ant-btn-primary" style={{ flexShrink: 0 }}>发送</button>
          </div>
        </div>
      )}

      {tab === "files" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ border: "2px dashed var(--c-border-2)", borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer", color: "var(--c-text-3)", fontSize: 14 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-mentor-accent)"; (e.currentTarget as HTMLElement).style.color = "var(--c-mentor-accent)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-3)"; }}>
            ↑ 点击上传或拖拽文件到此处（PDF、Word、Excel，最大50MB）
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", overflow: "hidden" }}>
            <table className="ant-table">
              <thead><tr><th>文件名</th><th>大小</th><th>上传者</th><th>日期</th><th>操作</th></tr></thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: f.type === "pdf" ? "#FFF1F0" : "#E6F4FF", color: f.type === "pdf" ? "var(--c-danger)" : "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{f.type.toUpperCase()}</div>
                        <span style={{ fontSize: 13 }}>{f.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--c-text-3)", fontSize: 13 }}>{f.size}</td>
                    <td style={{ color: "var(--c-text-2)", fontSize: 13 }}>{f.uploader}</td>
                    <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{f.date}</td>
                    <td><button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)" }}>下载</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "meeting" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="ant-btn ant-btn-primary">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              预约会议
            </button>
          </div>
          {meetings.map((m, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--c-border)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{m.title}</span>
                  <span className={ST[m.status]}>{m.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>{m.date} {m.time} · {m.duration}</div>
              </div>
              {m.link && (
                <a href={m.link} style={{ padding: "6px 16px", background: "var(--c-primary)", color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>加入会议</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
