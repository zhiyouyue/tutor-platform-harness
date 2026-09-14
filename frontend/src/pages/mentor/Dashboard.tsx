interface Props { onNavigate: (p: string) => void; }

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", ...style }}>
      {children}
    </div>
  );
}

const todaySchedule = [
  { time: "10:00", name: "张同学", type: "简历优化",  status: "即将开始", dot: "#FA8C16" },
  { time: "15:00", name: "李同学", type: "模拟面试",  status: "待确认",  dot: "var(--c-text-4)" },
  { time: "20:00", name: "陈同学", type: "面试复盘",  status: "已确认",  dot: "var(--c-success)" },
];

const todos = [
  { label: "待填写辅导记录", n: 2, color: "var(--c-danger)" },
  { label: "待上传交付结果", n: 1, color: "var(--c-warning)" },
  { label: "待确认辅导时间", n: 3, color: "var(--c-primary)" },
  { label: "学员新消息",     n: 5, color: "#722ED1" },
];

export default function Dashboard({ onNavigate }: Props) {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Greeting + streak */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text-1)" }}>早上好，王老师 👋</div>
          <div style={{ fontSize: 14, color: "var(--c-text-3)", marginTop: 4 }}>今天有 3 个辅导安排，2 条待办事项</div>
        </div>
        {/* Streak badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF8F0", border: "1px solid #FFD591", borderRadius: 12, padding: "12px 20px" }}>
          <div style={{ fontSize: 28 }}>🔥</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--c-mentor-accent)" }}>12</div>
            <div style={{ fontSize: 12, color: "var(--c-text-3)", lineHeight: 1.2 }}>连续辅导天数</div>
          </div>
          <div style={{ width: 1, height: 32, background: "#FFD591" }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#722ED1" }}>17</div>
            <div style={{ fontSize: 12, color: "var(--c-text-3)", lineHeight: 1.2 }}>累计学员</div>
          </div>
        </div>
      </div>

      {/* New project alert */}
      <div style={{ background: "#E6F4FF", border: "1px solid #91CAFF", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, background: "var(--c-primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#003EB3" }}>新项目待确认</div>
          <div style={{ fontSize: 13, color: "#0958D9", marginTop: 2 }}>张同学｜秋招求职辅导 · 复旦大学 金融 2027届 · 目标：互联网产品 · ¥4,800</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button className="ant-btn ant-btn-primary" style={{ padding: "4px 16px", fontSize: 13 }} onClick={() => onNavigate("projects")}>接受</button>
          <button className="ant-btn ant-btn-default" style={{ padding: "4px 12px", fontSize: 13 }}>拒绝</button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 20 }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Today */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>今日安排</span>
              <button style={{ fontSize: 13, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("schedule")}>查看日历 →</button>
            </div>
            <div style={{ padding: "8px 0" }}>
              {todaySchedule.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", borderBottom: i < todaySchedule.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                  <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "var(--c-text-1)", width: 40, flexShrink: 0 }}>{s.time}</span>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</span>
                    <span style={{ color: "var(--c-text-3)", fontSize: 13 }}> · {s.type}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: s.dot }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                    {s.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Projects overview */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>项目概览</span>
              <button style={{ fontSize: 13, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("projects")}>查看全部 →</button>
            </div>
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "进行中", n: 4, color: "var(--c-primary)",  bg: "var(--c-primary-bg)" },
                { label: "待确认", n: 1, color: "var(--c-warning)",  bg: "#FFF7E6" },
                { label: "已完成", n: 12, color: "var(--c-success)", bg: "#F6FFED" },
              ].map(s => (
                <button key={s.label} onClick={() => onNavigate("projects")} style={{ padding: "16px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: s.bg, textAlign: "center", transition: "transform 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{s.label}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Todos */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>待办事项</span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {todos.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--c-text-1)" }}>{t.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: t.color + "18", color: t.color }}>{t.n}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Income card */}
          <div style={{ background: "linear-gradient(135deg, #0F1929 0%, #1A2D45 100%)", borderRadius: 12, padding: 20, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>收入概览</span>
              <button style={{ fontSize: 12, color: "#60A5FA", background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate("income")}>明细 →</button>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 4 }}>¥8,600</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>本月收入 · 较上月 <span style={{ color: "#52C41A" }}>+23%</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>待结算</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FA8C16" }}>¥2,400</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>可提现</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#60A5FA" }}>¥8,000</div>
              </div>
            </div>
            <button style={{ width: "100%", padding: "9px", background: "var(--c-primary)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }} onClick={() => onNavigate("income")}>
              去提现
            </button>
          </div>

          {/* Achievements */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>成就</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: "🏆", label: "认证导师",   earned: true },
                { icon: "⭐", label: "10+学员",    earned: true },
                { icon: "🎯", label: "满意率90%",  earned: true },
                { icon: "📚", label: "50节辅导",   earned: false },
                { icon: "🌟", label: "金牌导师",   earned: false },
              ].map(a => (
                <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: a.earned ? 1 : 0.35 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: a.earned ? "#FFF4EE" : "var(--c-surface-2)", border: `1px solid ${a.earned ? "#FFD591" : "var(--c-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--c-text-3)", textAlign: "center" }}>{a.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
