import { useState } from "react";

const services = ["职业定位规划","简历诊断优化","求职投递策略","面试模拟与辅导","面试复盘","综合求职咨询","求职陪跑"];

const projects = [
  { id:"p1", student:"张明远", mentor:"王老师", type:"秋招求职辅导",  services:["职业定位规划","简历诊断优化","面试模拟与辅导"], fee:4800, progress:60,  status:"进行中", created:"2025-09-01" },
  { id:"p2", student:"李晓雯", mentor:"张老师", type:"简历优化",      services:["简历诊断优化"],                                   fee:800,  progress:100, status:"已完成", created:"2025-08-20" },
  { id:"p3", student:"王佳琪", mentor:"王老师", type:"面试辅导",      services:["面试模拟与辅导","面试复盘"],                         fee:2400, progress:30,  status:"进行中", created:"2025-09-05" },
  { id:"p4", student:"陈美琳", mentor:"刘老师", type:"职业规划",      services:["职业定位规划","综合求职咨询"],                       fee:1800, progress:100, status:"已完成", created:"2025-07-15" },
  { id:"p5", student:"周子轩", mentor:"",       type:"春招求职辅导",  services:["简历诊断优化","面试模拟与辅导"],                     fee:3200, progress:0,   status:"待分配", created:"2025-09-12" },
];

const ST: Record<string, string> = { "进行中":"ant-tag ant-tag-blue", "已完成":"ant-tag ant-tag-green", "待分配":"ant-tag ant-tag-orange" };

export default function SupervisorProjects() {
  const [showCreate, setShowCreate] = useState(false);
  const [selSvcs, setSelSvcs] = useState<string[]>([]);
  const [statusF, setStatusF] = useState("all");

  const rows = projects.filter(p => statusF === "all" || p.status === statusF);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>项目管理</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>共 {rows.length} 个项目</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={() => setShowCreate(v => !v)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          创建项目
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-primary)", borderRadius: "var(--radius)", padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>创建辅导项目</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>选择学员</div>
              <select className="ant-select" style={{ width: "100%" }}>
                <option>请选择学员</option>
                <option>张明远（复旦 · 金融 · 2027届）</option>
                <option>周子轩（浙大 · 市营 · 2027届）</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>指定导师</div>
              <select className="ant-select" style={{ width: "100%" }}>
                <option>请选择导师</option>
                <option>王老师 · 4个进行中</option>
                <option>张老师 · 3个进行中</option>
                <option>刘老师 · 2个进行中</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>项目类型</div>
              <input className="ant-input" placeholder="如：秋招求职全程辅导" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>服务费用 (¥)</div>
              <input className="ant-input" type="number" placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 8 }}>辅导内容（多选）</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {services.map(s => (
                <button key={s} onClick={() => setSelSvcs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{
                  padding: "4px 12px", borderRadius: 4, border: "1px solid", fontSize: 13, cursor: "pointer",
                  background: selSvcs.includes(s) ? "var(--c-primary-bg)" : "#fff",
                  color: selSvcs.includes(s) ? "var(--c-primary)" : "var(--c-text-2)",
                  borderColor: selSvcs.includes(s) ? "var(--c-primary)" : "var(--c-border-2)",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mentor recommendation */}
          {selSvcs.length > 0 && (
            <div style={{ marginTop: 16, padding: 14, background: "var(--c-primary-bg)", borderRadius: "var(--radius-sm)", border: "1px solid #91CAFF" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-primary)", marginBottom: 8 }}>推荐导师（匹配度最高）</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--c-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>王</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>王老师</div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>匹配度 92% · 擅长 {selSvcs[0]} · 当前 4 个项目</div>
                </div>
                <button className="ant-btn ant-btn-primary" style={{ marginLeft: "auto", padding: "3px 12px", fontSize: 12 }}>选择</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="ant-btn ant-btn-default" onClick={() => setShowCreate(false)}>取消</button>
            <button className="ant-btn ant-btn-primary">创建并分配</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 4 }}>
        {[["all","全部"],["进行中","进行中"],["已完成","已完成"],["待分配","待分配"]].map(([v, l]) => (
          <button key={v} onClick={() => setStatusF(v)} style={{
            padding: "4px 14px", borderRadius: 4, border: "1px solid", fontSize: 13, cursor: "pointer",
            background: statusF === v ? "var(--c-primary-bg)" : "#fff",
            color: statusF === v ? "var(--c-primary)" : "var(--c-text-2)",
            borderColor: statusF === v ? "var(--c-primary)" : "var(--c-border-2)",
            fontWeight: statusF === v ? 600 : 400,
          }}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", flex: 1, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="ant-table" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>学员</th><th>导师</th><th>项目类型</th><th>辅导内容</th>
                <th>进度</th><th>费用</th><th>创建日期</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{p.student[0]}</div>
                      <span style={{ fontWeight: 500 }}>{p.student}</span>
                    </div>
                  </td>
                  <td style={{ color: p.mentor ? "var(--c-text-2)" : "var(--c-danger)" }}>{p.mentor || "未分配"}</td>
                  <td>{p.type}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
                      {p.services.slice(0,2).map(s => <span key={s} className="ant-tag ant-tag-gray" style={{ fontSize: 11 }}>{s}</span>)}
                      {p.services.length > 2 && <span className="ant-tag ant-tag-gray" style={{ fontSize: 11 }}>+{p.services.length - 2}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--c-border)", borderRadius: 2 }}>
                        <div style={{ height: "100%", background: p.progress === 100 ? "var(--c-success)" : "var(--c-primary)", borderRadius: 2, width: `${p.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>¥{p.fee.toLocaleString()}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{p.created}</td>
                  <td><span className={ST[p.status]}>{p.status}</span></td>
                  <td>
                    <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)", padding: "2px 8px" }}>查看</button>
                    {p.status === "进行中" && <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-text-3)", padding: "2px 8px" }}>跟进</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
