import { useState } from "react";

type Tab = "pending"|"active"|"completed";

const projects = {
  pending: [
    { id:"p1", student:"张明远", school:"复旦大学", major:"金融学", year:"2027届", goal:"互联网产品", services:["职业定位","简历优化","模拟面试"], fee:"¥4,800" },
  ],
  active: [
    { id:"p2", student:"李晓雯", school:"上海交通大学", major:"计算机", year:"2026届", goal:"互联网运营", services:["简历优化","求职策略","面试辅导"], fee:"¥3,600", progress:60, next:"09/16 20:00 模拟面试" },
    { id:"p3", student:"王佳琪", school:"北京大学",    major:"经济学", year:"2026届", goal:"咨询",      services:["职业定位","简历优化"],              fee:"¥2,400", progress:30, next:"09/18 19:00 简历优化" },
    { id:"p4", student:"陈美琳", school:"武汉大学",    major:"市场营销",year:"2026届", goal:"互联网市场",services:["简历优化","面试辅导","面试复盘"],   fee:"¥3,200", progress:80, next:"09/14 20:00 面试复盘" },
  ],
  completed: [
    { id:"p5", student:"刘俊杰", school:"同济大学", major:"工业设计", year:"2025届", goal:"产品设计", services:["职业定位","简历优化","模拟面试"], fee:"¥4,800", completedDate:"2025-08-20", income:"¥3,840" },
    { id:"p6", student:"赵天宇", school:"浙江大学", major:"软件工程", year:"2025届", goal:"后端开发", services:["简历优化","模拟面试"],              fee:"¥2,800", completedDate:"2025-07-30", income:"¥2,240" },
  ],
} as const;

type Project = typeof projects["active"][0] | typeof projects["pending"][0] | typeof projects["completed"][0];

const tabLabels: Record<Tab, string> = { pending:"待确认", active:"进行中", completed:"已完成" };

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", overflow: "hidden" }}>{children}</div>;
}

export default function Projects({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>("active");
  const rows = projects[tab] as readonly Project[];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的项目</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>管理所有辅导项目</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--c-border)", background: "#fff", borderRadius: "8px 8px 0 0", border: "1px solid var(--c-border)", overflow: "hidden" }}>
        {(["pending","active","completed"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px 16px", fontSize: 14, cursor: "pointer",
            background: tab === t ? "#FFF4EE" : "#fff",
            border: "none", borderRight: "1px solid var(--c-border)",
            color: tab === t ? "var(--c-mentor-accent)" : "var(--c-text-2)",
            fontWeight: tab === t ? 600 : 400,
            transition: "all 0.15s",
          }}>
            {tabLabels[t]}
            <span style={{ marginLeft: 6, fontSize: 12, padding: "1px 6px", borderRadius: 10, background: tab === t ? "var(--c-mentor-accent)" : "var(--c-border)", color: tab === t ? "#fff" : "var(--c-text-3)" }}>
              {projects[t].length}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <Card><div style={{ padding: 60, textAlign: "center", color: "var(--c-text-4)" }}>暂无项目</div></Card>
      )}

      {rows.map(p => (
        <Card key={p.id}>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{p.student[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{p.student}｜秋招求职辅导</div>
                    <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>{p.school} · {p.major} · {p.year} · 目标：{p.goal}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{p.fee}</div>
                    {"income" in p && <div style={{ fontSize: 12, color: "var(--c-success)" }}>已结算 {(p as { income: string }).income}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {p.services.map(s => <span key={s} className="ant-tag ant-tag-gray" style={{ fontSize: 12 }}>{s}</span>)}
                </div>
                {"progress" in p && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>
                      <span>项目进度</span><span style={{ fontFamily: "'DM Mono',monospace" }}>{(p as { progress: number }).progress}%</span>
                    </div>
                    <div style={{ height: 5, background: "var(--c-border)", borderRadius: 3 }}>
                      <div style={{ height: "100%", background: "var(--c-mentor-accent)", borderRadius: 3, width: `${(p as { progress: number }).progress}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}
                {"next" in p && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--c-warning)", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1"/><path d="M1 4.5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                    下次：{(p as { next: string }).next}
                  </div>
                )}
                {"completedDate" in p && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--c-success)", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/><path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    完成于 {(p as { completedDate: string }).completedDate}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 8 }}>
            {tab === "pending" && (
              <>
                <button className="ant-btn ant-btn-primary" style={{ flex: 1, justifyContent: "center" }}>接受项目</button>
                <button className="ant-btn ant-btn-default">拒绝</button>
                <button className="ant-btn ant-btn-default" onClick={() => onSelectProject(p.id)}>查看详情</button>
              </>
            )}
            {tab === "active" && (
              <>
                <button className="ant-btn ant-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => onSelectProject(p.id)}>进入项目</button>
                <button className="ant-btn ant-btn-default">交付空间</button>
              </>
            )}
            {tab === "completed" && (
              <button className="ant-btn ant-btn-default" onClick={() => onSelectProject(p.id)}>查看记录</button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
