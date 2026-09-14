import { useState } from "react";

const days = ["周一","周二","周三","周四","周五","周六","周日"];
const defaultSlots: Record<string,string[]> = {
  周一:["19:00–22:00"], 周二:[], 周三:["19:00–22:00"], 周四:[], 周五:["18:00–22:00"], 周六:["10:00–18:00"], 周日:[],
};
const upcoming = [
  { date:"09/16 (周二)", time:"20:00", student:"张同学", type:"模拟面试", status:"已确认" },
  { date:"09/18 (周四)", time:"19:00", student:"王同学", type:"简历优化", status:"待确认" },
  { date:"09/20 (周六)", time:"14:00", student:"陈同学", type:"面试复盘", status:"已确认" },
];

export default function Schedule() {
  const [slots, setSlots] = useState(defaultSlots);
  const [accepting, setAccepting] = useState(true);
  const [showBlock, setShowBlock] = useState(false);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的时间</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>设置可辅导时间，班主任将据此为你安排预约</div>
      </div>

      {/* Accept toggle */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: accepting ? "#F6FFED" : "#FFFBE6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: accepting ? "var(--c-success)" : "var(--c-warning)" }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{accepting ? "🟢 可接受项目" : "⚪ 暂停接受项目"}</div>
            <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>{accepting ? "当前可接受新的学员预约" : "暂时不接受新学员"}</div>
          </div>
        </div>
        <button
          onClick={() => setAccepting(a => !a)}
          style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: accepting ? "var(--c-success)" : "var(--c-border-2)", position: "relative", transition: "background 0.2s" }}
        >
          <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 3, left: accepting ? "calc(100% - 21px)" : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20 }}>
        {/* Weekly schedule */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>每周可辅导时间</span>
            <button className="ant-btn ant-btn-default" style={{ padding: "3px 12px", fontSize: 12 }}>添加时段</button>
          </div>
          <div style={{ padding: "8px 0" }}>
            {days.map(day => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", borderBottom: "1px solid var(--c-border)" }}>
                <div style={{ width: 36, fontSize: 13, fontWeight: 500, color: "var(--c-text-2)", flexShrink: 0 }}>{day}</div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {slots[day].length === 0
                    ? <span style={{ fontSize: 12, color: "var(--c-text-4)", fontStyle: "italic" }}>暂不可用</span>
                    : slots[day].map(s => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "var(--c-primary-bg)", border: "1px solid #91CAFF", borderRadius: 4, fontSize: 12, color: "var(--c-primary)" }}>
                        {s}
                        <button onClick={() => setSlots(prev => ({ ...prev, [day]: prev[day].filter(x => x !== s) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#91CAFF", padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Block period */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>临时不可用</span>
              <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)" }} onClick={() => setShowBlock(v => !v)}>添加</button>
            </div>
            {showBlock && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>开始日期</div><input type="date" className="ant-input" /></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>结束日期</div><input type="date" className="ant-input" /></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>原因（可选）</div><input className="ant-input" placeholder="如：出差、休假" /></div>
                <button className="ant-btn ant-btn-primary" style={{ width: "100%", justifyContent: "center" }}>确认</button>
              </div>
            )}
            {!showBlock && <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: "var(--c-text-4)" }}>暂无临时不可用时段</div>}
          </div>

          {/* Upcoming */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 14 }}>近期辅导安排</div>
            <div style={{ padding: "8px 0" }}>
              {upcoming.map((s, i) => (
                <div key={i} style={{ padding: "10px 20px", borderBottom: i < upcoming.length-1 ? "1px solid var(--c-border)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.student} · {s.type}</div>
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: s.status === "已确认" ? "#F6FFED" : "#FFFBE6", color: s.status === "已确认" ? "var(--c-success)" : "var(--c-warning)", border: `1px solid ${s.status === "已确认" ? "#B7EB8F" : "#FFD591"}` }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 3 }}>{s.date} {s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
