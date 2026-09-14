import { useState } from "react";

type DetailTab = "overview"|"records"|"results";

const nodes = [
  { label:"职业定位", done:true,  date:"09/05" },
  { label:"简历优化", done:true,  date:"09/10" },
  { label:"模拟面试", active:true },
  { label:"面试复盘", done:false },
  { label:"项目完成", done:false },
];

type RecordItem = { date:string; type:string; duration:string; summary:string; attachments:string[] };
const records: RecordItem[] = [
  { date:"2025-09-10", type:"简历优化", duration:"60分钟", summary:"完成简历结构优化，强化实习经历量化描述，突出产品思维能力。", attachments:["简历v2.0.pdf"] },
  { date:"2025-09-05", type:"职业定位", duration:"90分钟", summary:"深度访谈确定方向为互联网产品经理，梳理核心竞争力与求职策略。", attachments:["职业定位分析.pdf"] },
];

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", ...style }}>{children}</div>;
}

interface Props { projectId: string; onBack: () => void; onOpenDelivery: () => void; }

export default function ProjectDetail({ onBack, onOpenDelivery }: Props) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Back */}
      <div>
        <button className="ant-btn ant-btn-text" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-text-2)", marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          返回项目列表
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>张同学｜秋招求职辅导</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span className="ant-tag ant-tag-blue">进行中</span>
              <span style={{ fontSize: 12, color: "var(--c-text-3)" }}>开始于 2025-09-05</span>
            </div>
          </div>
          <button className="ant-btn ant-btn-primary" onClick={onOpenDelivery}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9V5a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0112 5v4M2 9l2-2h6l2 2M5 6h4M5 7.5h2" stroke="white" strokeWidth="1.1" strokeLinecap="round"/></svg>
            进入交付空间
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--c-border)" }}>
        {([["overview","项目概览"],["records","辅导记录"],["results","交付结果"]] as [DetailTab,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", fontSize: 14, cursor: "pointer",
            background: "transparent", border: "none", borderBottom: tab === id ? "2px solid var(--c-mentor-accent)" : "2px solid transparent",
            color: tab === id ? "var(--c-mentor-accent)" : "var(--c-text-2)",
            fontWeight: tab === id ? 600 : 400, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 15 }}>学员档案</div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, flexShrink: 0 }}>张</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>张明远</div>
                    <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>复旦大学 · 金融学 · 2027届</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[["所在城市","上海"],["求职目标","互联网产品岗"],["目标行业","互联网 / AI"],["目标城市","北京 / 上海"]].map(([l,v]) => (
                    <div key={l} style={{ background: "var(--c-surface-2)", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "var(--c-text-3)", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#FFF8F0", borderRadius: 8, border: "1px solid #FFD591" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#AD6800", marginBottom: 4 }}>核心问题</div>
                  <div style={{ fontSize: 13, color: "#5C3C00" }}>简历竞争力不足，缺乏产品思维案例；面试表达结构化不足，容易跑偏。</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 15 }}>项目目标</div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {["明确产品经理方向，建立职业信心","完成简历全面优化，突出产品能力","完成2轮模拟面试，掌握结构化表达","制定针对性求职投递策略"].map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--c-text-1)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                    {g}
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 15 }}>项目节点</div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {nodes.map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${n.done ? "var(--c-success)" : n.active ? "var(--c-mentor-accent)" : "var(--c-border-2)"}`, background: n.done ? "var(--c-success)" : n.active ? "#FFF4EE" : "#fff" }}>
                      {n.done ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2 2 5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : n.active ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-mentor-accent)" }} />
                      : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: n.active ? 600 : 400, color: n.done ? "var(--c-text-1)" : n.active ? "var(--c-mentor-accent)" : "var(--c-text-3)" }}>{n.label}</div>
                    </div>
                    {n.done && <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>✓ {n.date}</div>}
                    {n.active && <div style={{ fontSize: 11, color: "var(--c-mentor-accent)", fontWeight: 600 }}>进行中</div>}
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>辅导内容</div>
              {["职业定位","简历优化","模拟面试","面试复盘"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 3 ? "1px solid var(--c-border)" : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i+1}</span>
                  <span style={{ fontSize: 14 }}>{s}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-border)" }}>
                <span style={{ fontSize: 13, color: "var(--c-text-3)" }}>项目费用</span>
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "'DM Mono',monospace" }}>¥4,800</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "records" && (
        <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="ant-btn ant-btn-primary" onClick={() => setShowForm(v => !v)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              填写辅导记录
            </button>
          </div>
          {showForm && (
            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>新辅导记录</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>辅导日期</div><input type="date" className="ant-input" /></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>辅导类型</div><select className="ant-select" style={{ width: "100%" }}><option>模拟面试</option><option>简历优化</option><option>职业定位</option></select></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>时长</div><input className="ant-input" placeholder="如：60分钟" /></div>
              </div>
              <div style={{ marginBottom: 16 }}><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>辅导内容摘要</div><textarea className="ant-input" rows={4} placeholder="记录本次辅导核心内容、学员反馈和建议..." style={{ resize: "none" }} /></div>
              <div style={{ border: "2px dashed var(--c-border-2)", borderRadius: 8, padding: "16px", textAlign: "center", fontSize: 13, color: "var(--c-text-3)", cursor: "pointer", marginBottom: 16 }}>点击上传或拖拽附件</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="ant-btn ant-btn-default" onClick={() => setShowForm(false)}>取消</button>
                <button className="ant-btn ant-btn-primary">提交记录</button>
              </div>
            </Card>
          )}
          {records.map((r, i) => (
            <Card key={i} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className="ant-tag ant-tag-blue">{r.type}</span>
                <span style={{ fontSize: 13, color: "var(--c-text-3)" }}>{r.date} · {r.duration}</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--c-text-1)", lineHeight: 1.6 }}>{r.summary}</div>
              {r.attachments.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {r.attachments.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderRadius: 6, fontSize: 12, color: "var(--c-text-2)", cursor: "pointer" }}>
                      📎 {a}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "results" && (
        <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { name:"职业定位", status:"已完成", file:"职业定位分析.pdf", date:"09/05", color:"var(--c-success)" },
            { name:"简历优化", status:"已完成", file:"简历v2.0.pdf",     date:"09/10", color:"var(--c-success)" },
            { name:"模拟面试", status:"进行中", file:null,               date:null,    color:"var(--c-mentor-accent)" },
            { name:"面试复盘", status:"待开始", file:null,               date:null,    color:"var(--c-text-4)" },
          ].map((d, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: d.color + "18", color: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                {d.file && <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>交付文件：{d.file} · {d.date}</div>}
              </div>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: d.color + "18", color: d.color, border: `1px solid ${d.color}40` }}>{d.status}</span>
              {d.status === "进行中" && <button className="ant-btn ant-btn-primary" style={{ padding: "3px 12px", fontSize: 12 }}>上传结果</button>}
              {d.file && <button className="ant-btn ant-btn-default" style={{ padding: "3px 10px", fontSize: 12 }}>查看</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
