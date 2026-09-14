import { useState } from "react";
import type { SupervisorPage } from "./SupervisorLayout";

/* ── tiny sparkline / bar-chart helpers ── */
function Sparkline({ d, color = "var(--c-primary)", h = 36 }: { d: number[]; color?: string; h?: number }) {
  const w = 100;
  const mn = Math.min(...d), mx = Math.max(...d), rng = mx - mn || 1;
  const pts = d.map((v, i) => `${(i / (d.length - 1)) * w},${h - 4 - ((v - mn) / rng) * (h - 8)}`).join(" ");
  const area = `${pts} ${w},${h} 0,${h}`;
  const gid = `sp${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function MiniBar({ d, color = "var(--c-primary)" }: { d: number[]; color?: string }) {
  const mx = Math.max(...d) || 1;
  return (
    <svg width={100} height={36} viewBox="0 0 100 36" preserveAspectRatio="none" style={{ display: "block" }}>
      {d.map((v, i) => {
        const bw = 100 / d.length - 2;
        const bh = (v / mx) * 30;
        return <rect key={i} x={i * (100 / d.length) + 1} y={36 - bh} width={bw} height={bh} fill={color} rx="1" />;
      })}
    </svg>
  );
}

/* ── KPI stat card ── */
interface StatCardProps {
  label: string;
  value: string;
  daily?: string;
  dailyLabel?: string;
  weekDelta?: string;
  dayDelta?: string;
  chart?: "line" | "bar";
  chartData?: number[];
  chartColor?: string;
}
function StatCard({ label, value, daily, dailyLabel, weekDelta, dayDelta, chart = "line", chartData, chartColor }: StatCardProps) {
  const wUp = weekDelta?.startsWith("+");
  const dUp = dayDelta?.startsWith("+");
  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)", padding: "20px 24px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "var(--c-text-2)" }}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.3 }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-text-1)", letterSpacing: "-0.5px", lineHeight: 1.2, margin: "8px 0 12px" }}>{value}</div>
      {chartData && (
        <div style={{ marginBottom: 10 }}>
          {chart === "line" ? <Sparkline d={chartData} color={chartColor} /> : <MiniBar d={chartData} color={chartColor} />}
        </div>
      )}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--c-text-3)" }}>
        {weekDelta && (
          <span>
            周同比 <span style={{ color: wUp ? "#F5222D" : "#52C41A", fontWeight: 600 }}>{weekDelta} {wUp ? "▲" : "▼"}</span>
          </span>
        )}
        {dayDelta && (
          <span>
            日同比 <span style={{ color: dUp ? "#F5222D" : "#52C41A", fontWeight: 600 }}>{dayDelta} {dUp ? "▲" : "▼"}</span>
          </span>
        )}
      </div>
      {daily && (
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--c-text-3)" }}>
          {dailyLabel ?? "今日"}: <span style={{ color: "var(--c-text-2)" }}>{daily}</span>
        </div>
      )}
    </div>
  );
}

/* ── bar chart for monthly overview ── */
const monthlyData = [
  { m: "4月", v: 32 }, { m: "5月", v: 48 }, { m: "6月", v: 38 },
  { m: "7月", v: 72 }, { m: "8月", v: 65 }, { m: "9月", v: 54 },
];
const rankData = [
  { name: "王老师", completed: 17, income: "¥56,800" },
  { name: "张老师", completed: 12, income: "¥38,400" },
  { name: "刘老师", completed: 9,  income: "¥28,800" },
  { name: "陈老师", completed: 7,  income: "¥22,400" },
  { name: "赵老师", completed: 5,  income: "¥16,000" },
];

type TimeRange = "today" | "week" | "month" | "year";

const recentProjects = [
  { student: "张明远", mentor: "王老师", type: "秋招求职辅导", progress: 60, status: "进行中", fee: "¥4,800", created: "09-01" },
  { student: "李晓雯", mentor: "张老师", type: "简历优化",    progress: 100, status: "已完成", fee: "¥800",   created: "08-20" },
  { student: "王佳琪", mentor: "王老师", type: "面试辅导",    progress: 30, status: "进行中", fee: "¥2,400",  created: "09-05" },
  { student: "陈美琳", mentor: "刘老师", type: "职业规划",    progress: 100, status: "已完成", fee: "¥1,800",  created: "07-15" },
  { student: "周子轩", mentor: "未分配",  type: "春招辅导",   progress: 0,  status: "待分配", fee: "¥3,200",  created: "09-12" },
];

const statusTag: Record<string, string> = {
  "进行中": "ant-tag ant-tag-blue",
  "已完成": "ant-tag ant-tag-green",
  "待分配": "ant-tag ant-tag-orange",
};

export default function SupervisorDashboard({ onNavigate }: { onNavigate: (p: SupervisorPage) => void }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("year");
  const maxV = Math.max(...monthlyData.map(d => d.v));

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100%" }}>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard
          label="进行中项目"
          value="12"
          daily="3" dailyLabel="今日新增"
          weekDelta="+16.7%" dayDelta="+2"
          chartData={[4,5,6,5,7,8,8,9,10,10,11,12]}
          chartColor="var(--c-primary)"
        />
        <StatCard
          label="本月新增学员"
          value="8"
          daily="1" dailyLabel="今日新增"
          weekDelta="+14.3%" dayDelta="+1"
          chart="bar"
          chartData={[2,3,4,3,5,6,5,7]}
          chartColor="var(--c-purple)"
        />
        <StatCard
          label="活跃导师"
          value="6"
          daily="5" dailyLabel="今日在线"
          weekDelta="+0%" dayDelta="+1"
          chartData={[4,4,5,5,5,6,6,5,6,6,6,6]}
          chartColor="var(--c-success)"
        />
        <StatCard
          label="本月完成项目"
          value="5"
          daily="¥17,400" dailyLabel="本月营收"
          weekDelta="+25%" dayDelta="+1"
          chart="bar"
          chartData={[1,2,1,3,2,4,3,5]}
          chartColor="var(--c-warning)"
        />
      </div>

      {/* ── Chart + Ranking ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16 }}>

        {/* Monthly chart */}
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text-1)", borderBottom: "2px solid var(--c-primary)", paddingBottom: 2 }}>项目完成数</span>
              <span style={{ fontSize: 15, color: "var(--c-text-3)", cursor: "pointer" }}>营收金额</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["today","week","month","year"] as TimeRange[]).map(t => (
                <button key={t} onClick={() => setTimeRange(t)} style={{
                  padding: "2px 10px", fontSize: 12, borderRadius: 4, border: "none", cursor: "pointer",
                  background: timeRange === t ? "var(--c-primary-bg)" : "transparent",
                  color: timeRange === t ? "var(--c-primary)" : "var(--c-text-3)",
                  fontWeight: timeRange === t ? 600 : 400,
                }}>
                  {{today:"今日", week:"本周", month:"本月", year:"全年"}[t]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "24px 24px 16px" }}>
            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
              {monthlyData.map(({ m, v }) => (
                <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace" }}>{v}</div>
                  <div style={{
                    width: "100%", maxWidth: 40,
                    height: Math.round((v / maxV) * 100) + "%",
                    background: "var(--c-primary)",
                    borderRadius: "3px 3px 0 0",
                    minHeight: 4,
                    transition: "height 0.5s",
                  }} />
                  <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentor ranking */}
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", fontSize: 15, fontWeight: 600 }}>导师完成排名</div>
          <div style={{ padding: "0 24px" }}>
            {rankData.map((r, i) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < rankData.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: i === 0 ? "#FFC53D" : i === 1 ? "#D9D9D9" : i === 2 ? "#FA8C16" : "transparent",
                  color: i < 3 ? "#fff" : "var(--c-text-3)",
                  border: i >= 3 ? "1px solid var(--c-border)" : "none",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text-1)" }}>{r.name}</div>
                  <div style={{ height: 4, background: "var(--c-border)", borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: "100%", background: i === 0 ? "var(--c-primary)" : "var(--c-text-4)", borderRadius: 2, width: `${(r.completed / rankData[0].completed) * 100}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-1)" }}>{r.completed}</div>
                  <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>{r.income}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent projects table ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>近期项目</span>
          <button className="ant-btn ant-btn-text" style={{ fontSize: 13 }} onClick={() => onNavigate("projects")}>
            查看全部 →
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ant-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>学员</th><th>导师</th><th>项目类型</th><th>创建日期</th>
                <th>进度</th><th>金额</th><th>状态</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p, i) => (
                <tr key={i} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                        {p.student[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.student}</span>
                    </div>
                  </td>
                  <td style={{ color: p.mentor === "未分配" ? "var(--c-danger)" : "var(--c-text-2)" }}>{p.mentor}</td>
                  <td>{p.type}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>2025-{p.created}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--c-border)", borderRadius: 2, minWidth: 60 }}>
                        <div className="ant-progress-bg" style={{ height: "100%", background: p.progress === 100 ? "var(--c-success)" : "var(--c-primary)", borderRadius: 2, width: `${p.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--c-text-3)", width: 28, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{p.fee}</td>
                  <td><span className={statusTag[p.status] ?? "ant-tag ant-tag-gray"}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Alerts row ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", fontSize: 15, fontWeight: 600 }}>
          待处理事项
          <span style={{ marginLeft: 8, padding: "0 6px", background: "var(--c-danger)", color: "#fff", borderRadius: 10, fontSize: 12 }}>3</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ant-table">
            <thead><tr><th>学员</th><th>负责导师</th><th>问题描述</th><th>紧急度</th><th>操作</th></tr></thead>
            <tbody>
              {[
                { s: "张明远", m: "王老师",  issue: "待确认辅导时间", level: "中" },
                { s: "周子轩", m: "未分配",  issue: "项目已创建，待分配导师", level: "高" },
                { s: "吴晓峰", m: "陈老师",  issue: "辅导记录待填写 (2条)", level: "低" },
              ].map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{a.s}</td>
                  <td style={{ color: a.m === "未分配" ? "var(--c-danger)" : "var(--c-text-2)" }}>{a.m}</td>
                  <td style={{ color: "var(--c-text-2)" }}>{a.issue}</td>
                  <td>
                    <span className={`ant-tag ${a.level === "高" ? "ant-tag-red" : a.level === "中" ? "ant-tag-orange" : "ant-tag-gray"}`}>{a.level}</span>
                  </td>
                  <td>
                    <button className="ant-btn ant-btn-text" style={{ fontSize: 12, padding: "2px 8px", color: "var(--c-primary)" }}>处理</button>
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
