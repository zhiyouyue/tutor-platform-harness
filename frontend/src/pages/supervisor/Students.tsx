import { useState } from "react";

const ALL = [
  { id:"s1", name:"张明远", school:"复旦大学",    major:"金融学",    year:"2027", goal:"产品经理", industry:"互联网", city:"上海", status:"active",    mentor:"王老师", joined:"2025-09-01" },
  { id:"s2", name:"李晓雯", school:"上海交通大学", major:"计算机",    year:"2026", goal:"运营",    industry:"互联网", city:"上海", status:"active",    mentor:"张老师", joined:"2025-08-20" },
  { id:"s3", name:"王佳琪", school:"北京大学",    major:"经济学",    year:"2026", goal:"咨询顾问", industry:"咨询",   city:"北京", status:"active",    mentor:"王老师", joined:"2025-09-05" },
  { id:"s4", name:"周子轩", school:"浙江大学",    major:"市场营销",  year:"2027", goal:"市场",    industry:"快消",   city:"杭州", status:"new",       mentor:"",       joined:"2025-09-12" },
  { id:"s5", name:"陈美琳", school:"武汉大学",    major:"人力资源",  year:"2026", goal:"HR",      industry:"互联网", city:"武汉", status:"completed", mentor:"刘老师", joined:"2025-07-15" },
  { id:"s6", name:"刘俊杰", school:"同济大学",    major:"工业设计",  year:"2025", goal:"产品设计", industry:"互联网", city:"上海", status:"completed", mentor:"王老师", joined:"2025-06-01" },
];

const STATUS_TAG: Record<string, string> = {
  active:    "ant-tag ant-tag-blue",
  new:       "ant-tag ant-tag-orange",
  completed: "ant-tag ant-tag-green",
};
const STATUS_LABEL: Record<string, string> = { active:"辅导中", new:"新学员", completed:"已完成" };

export default function Students() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<typeof ALL[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const rows = ALL.filter(s =>
    (statusFilter === "all" || s.status === statusFilter) &&
    [s.name, s.school, s.major, s.mentor].some(v => v.includes(search))
  );

  if (selected) return <StudentDetail s={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--c-text-1)" }}>学员管理</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>共 {rows.length} 名学员</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={() => setShowAdd(v => !v)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          新增学员
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-primary)", borderRadius: "var(--radius)", padding: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>新增学员档案</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {[["学员姓名","text"],["学校","text"],["专业","text"],["毕业年份","text"],["所在城市","text"],["求职目标","text"]].map(([l]) => (
              <div key={l}>
                <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>{l}</div>
                <input className="ant-input" placeholder={`请输入${l}`} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>背景 / 核心问题</div>
            <textarea className="ant-input" rows={2} placeholder="描述学员当前情况..." style={{ resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="ant-btn ant-btn-default" onClick={() => setShowAdd(false)}>取消</button>
            <button className="ant-btn ant-btn-primary">保存</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--c-text-3)" }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input className="ant-input" placeholder="搜索学员、学校、导师…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 28, width: 220 }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all","全部"],["active","辅导中"],["new","新学员"],["completed","已完成"]].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} style={{
              padding: "4px 12px", borderRadius: 4, border: "1px solid", fontSize: 13, cursor: "pointer", transition: "all 0.15s",
              background: statusFilter === v ? "var(--c-primary-bg)" : "#fff",
              color: statusFilter === v ? "var(--c-primary)" : "var(--c-text-2)",
              borderColor: statusFilter === v ? "var(--c-primary)" : "var(--c-border-2)",
              fontWeight: statusFilter === v ? 600 : 400,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
          <table className="ant-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>学员</th><th>学校 / 专业</th><th>届别</th><th>目标岗位</th>
                <th>负责导师</th><th>加入时间</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{s.name[0]}</div>
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--c-text-2)" }}>{s.school} · {s.major}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{s.year}届</td>
                  <td>{s.goal}</td>
                  <td style={{ color: s.mentor ? "var(--c-text-2)" : "var(--c-danger)" }}>{s.mentor || "未分配"}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{s.joined}</td>
                  <td><span className={STATUS_TAG[s.status]}>{STATUS_LABEL[s.status]}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)", padding: "2px 8px" }}>详情</button>
                    {!s.mentor && <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-warning)", padding: "2px 8px" }}>分配</button>}
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

function StudentDetail({ s, onBack }: { s: typeof ALL[0]; onBack: () => void }) {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <button className="ant-btn ant-btn-text" onClick={onBack} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6, color: "var(--c-text-2)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        返回学员列表
      </button>

      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--radius)", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>{s.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
            <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>{s.school} · {s.major} · {s.year}届</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span className={`ant-tag ${STATUS_TAG[s.status]}`}>{STATUS_LABEL[s.status]}</span>
              {s.mentor && <span className="ant-tag ant-tag-gray">导师: {s.mentor}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
          {[["目标岗位", s.goal], ["目标行业", s.industry], ["所在城市", s.city], ["加入时间", s.joined]].map(([l, v]) => (
            <div key={l} style={{ background: "var(--c-surface-2)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--c-text-3)", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {!s.mentor && (
        <div style={{ background: "#FFFBE6", border: "1px solid #FFD666", borderRadius: "var(--radius)", padding: 20 }}>
          <div style={{ fontWeight: 600, color: "#AD6800", marginBottom: 12 }}>该学员尚未分配导师</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select className="ant-select" style={{ flex: 1, maxWidth: 320 }}>
              <option>选择导师</option>
              <option>王老师（产品/互联网/应届生）</option>
              <option>张老师（运营/快消/1-5年）</option>
              <option>刘老师（咨询/金融/应届生）</option>
            </select>
            <button className="ant-btn ant-btn-primary">分配并创建项目</button>
          </div>
        </div>
      )}
    </div>
  );
}
