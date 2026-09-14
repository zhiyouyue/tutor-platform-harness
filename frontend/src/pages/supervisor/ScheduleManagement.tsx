import { useState } from "react";

const weekDays = ["周一","周二","周三","周四","周五","周六","周日"];
const dates    = ["9/15","9/16","9/17","9/18","9/19","9/20","9/21"];

const appts = [
  { day:"周一", date:"9/15", time:"10:00", student:"张同学", mentor:"王老师", type:"简历优化",  status:"已确认" },
  { day:"周三", date:"9/17", time:"19:30", student:"王同学", mentor:"王老师", type:"面试辅导",  status:"待确认" },
  { day:"周四", date:"9/18", time:"20:00", student:"赵同学", mentor:"刘老师", type:"职业规划",  status:"已确认" },
  { day:"周五", date:"9/19", time:"18:30", student:"李同学", mentor:"张老师", type:"简历优化",  status:"待确认" },
  { day:"周六", date:"9/20", time:"10:00", student:"陈同学", mentor:"王老师", type:"模拟面试",  status:"已确认" },
  { day:"周六", date:"9/20", time:"14:00", student:"周同学", mentor:"陈老师", type:"面试复盘",  status:"已确认" },
];

const mentors = [
  { name:"王老师", slots:["周一 19-22","周三 19-22","周五 18-22","周六 10-18"], active:4, ok:true },
  { name:"张老师", slots:["周二 19-22","周四 19-22","周日 10-16"],              active:3, ok:true },
  { name:"刘老师", slots:["周一 20-22","周五 19-22","周六 14-18"],              active:2, ok:true },
  { name:"陈老师", slots:["周三 20-22","周六 10-14"],                            active:3, ok:false },
];

const allAppts = [
  { student:"张明远", mentor:"王老师", date:"2025-09-16", time:"20:00", type:"模拟面试",  status:"待开始", duration:"60min" },
  { student:"李晓雯", mentor:"张老师", date:"2025-09-10", time:"19:30", type:"简历优化",  status:"已完成", duration:"60min" },
  { student:"王佳琪", mentor:"王老师", date:"2025-09-05", time:"20:00", type:"职业定位",  status:"已完成", duration:"90min" },
  { student:"赵同学", mentor:"刘老师", date:"2025-09-18", time:"20:00", type:"职业规划",  status:"已确认", duration:"60min" },
];
const AST: Record<string,string> = { "待开始":"ant-tag ant-tag-orange","已完成":"ant-tag ant-tag-green","已确认":"ant-tag ant-tag-blue","待确认":"ant-tag ant-tag-gray" };

export default function ScheduleManagement() {
  const [tab, setTab] = useState<"cal"|"avail"|"list">("cal");
  const [showBook, setShowBook] = useState(false);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>预约协调</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>本周共 {appts.length} 个预约</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={() => setShowBook(v => !v)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          安排预约
        </button>
      </div>

      {showBook && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-primary)", borderRadius: "var(--radius)", padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>安排辅导预约</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>选择学员/项目</div>
              <select className="ant-select" style={{ width: "100%" }}>
                <option>请选择</option>
                <option>张明远 → 王老师（模拟面试）</option>
                <option>王佳琪 → 王老师（面试辅导）</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>辅导类型</div>
              <select className="ant-select" style={{ width: "100%" }}>
                <option>模拟面试</option><option>简历优化</option><option>职业定位</option><option>面试复盘</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>预约日期时间</div>
              <input type="datetime-local" className="ant-input" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="ant-btn ant-btn-default" onClick={() => setShowBook(false)}>取消</button>
            <button className="ant-btn ant-btn-primary">确认预约</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--c-border)" }}>
        {([["cal","本周日历"],["avail","导师可用时间"],["list","预约记录"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", fontSize: 14, cursor: "pointer",
            background: "transparent", border: "none", borderBottom: tab === id ? "2px solid var(--c-primary)" : "2px solid transparent",
            color: tab === id ? "var(--c-primary)" : "var(--c-text-2)",
            fontWeight: tab === id ? 600 : 400,
            transition: "all 0.15s", marginBottom: -1,
          }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "cal" && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--c-border)" }}>
            {weekDays.map((d, i) => (
              <div key={d} style={{ padding: "10px", textAlign: "center", borderRight: i < 6 ? "1px solid var(--c-border)" : "none" }}>
                <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>{d}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text-1)", marginTop: 2 }}>{dates[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: 8, gap: 4, minHeight: 160 }}>
            {weekDays.map((day, di) => {
              const dayAppts = appts.filter(a => a.day === day);
              return (
                <div key={day} style={{ borderRight: di < 6 ? "1px solid var(--c-border)" : "none", padding: "4px 4px", minHeight: 120 }}>
                  {dayAppts.map((a, i) => (
                    <div key={i} style={{
                      marginBottom: 6, padding: "6px 8px", borderRadius: 4, fontSize: 11, lineHeight: 1.4,
                      background: a.status === "已确认" ? "var(--c-primary)" : "#FA8C16",
                      color: "#fff",
                    }}>
                      <div style={{ fontWeight: 600 }}>{a.time}</div>
                      <div style={{ opacity: 0.9 }}>{a.student} · {a.mentor}</div>
                      <div style={{ opacity: 0.75 }}>{a.type}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "avail" && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <table className="ant-table">
            <thead><tr><th>导师</th><th>可辅导时间</th><th>当前项目数</th><th>接项目状态</th><th>操作</th></tr></thead>
            <tbody>
              {mentors.map(m => (
                <tr key={m.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{m.name[0]}</div>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {m.slots.map(s => <span key={s} className="ant-tag ant-tag-blue" style={{ fontSize: 11 }}>{s}</span>)}
                    </div>
                  </td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{m.active}</td>
                  <td><span className={m.ok ? "ant-tag ant-tag-green" : "ant-tag ant-tag-gray"}>{m.ok ? "可接项目" : "暂停接项目"}</span></td>
                  <td><button className="ant-btn ant-btn-primary" style={{ padding: "3px 12px", fontSize: 12 }} onClick={() => setShowBook(true)}>安排预约</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "list" && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <table className="ant-table">
            <thead><tr><th>学员</th><th>导师</th><th>辅导类型</th><th>时间</th><th>时长</th><th>状态</th></tr></thead>
            <tbody>
              {allAppts.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{a.student}</td>
                  <td style={{ color: "var(--c-text-2)" }}>{a.mentor}</td>
                  <td>{a.type}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{a.date} {a.time}</td>
                  <td style={{ color: "var(--c-text-3)" }}>{a.duration}</td>
                  <td><span className={AST[a.status]}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
