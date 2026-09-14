import { useState } from "react";

type IncTab = "overview"|"detail"|"withdraw";

const detail = [
  { student:"张同学", service:"简历优化",      amount:800,  status:"待结算", date:"2025-09-10" },
  { student:"李同学", service:"模拟面试",      amount:1200, status:"已结算", date:"2025-09-08" },
  { student:"陈同学", service:"求职陪跑",      amount:3600, status:"已结算", date:"2025-09-05" },
  { student:"刘同学", service:"简历诊断优化",  amount:600,  status:"待结算", date:"2025-09-03" },
  { student:"赵同学", service:"面试模拟与辅导",amount:1800, status:"已结算", date:"2025-08-28" },
];

const monthly = [35,55,40,75,65,86];
const monthLabels = ["4月","5月","6月","7月","8月","9月"];

export default function Income() {
  const [tab, setTab] = useState<IncTab>("overview");
  const [amount, setAmount] = useState("8000");
  const maxV = Math.max(...monthly);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的收入</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>查看项目收入和结算状态</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>
        {([["overview","收入概览"],["detail","收入明细"],["withdraw","提现"]] as [IncTab,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", fontSize: 14, cursor: "pointer", background: "transparent", border: "none",
            borderBottom: tab === id ? "2px solid var(--c-mentor-accent)" : "2px solid transparent",
            color: tab === id ? "var(--c-mentor-accent)" : "var(--c-text-2)",
            fontWeight: tab === id ? 600 : 400, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
            {[
              { label:"本月收入",   value:"¥8,600",  sub:"+23% vs 上月", subColor:"var(--c-success)", bg:"#0F1929", textColor:"#fff" },
              { label:"待结算",     value:"¥2,400",  sub:"预计3个工作日到账", subColor:"var(--c-warning)", bg:"#FFFBE6", textColor:"#0F1929" },
              { label:"可提现",     value:"¥8,000",  sub:"已结算未提现", subColor:"var(--c-primary)", bg:"var(--c-primary-bg)", textColor:"#0F1929" },
              { label:"累计收入",   value:"¥56,800", sub:"自2024年7月起", subColor:"var(--c-text-3)", bg:"#fff", textColor:"#0F1929" },
            ].map(s => (
              <div key={s.label} style={{ padding: 20, borderRadius: 12, background: s.bg, border: s.bg === "#fff" ? "1px solid var(--c-border)" : "none" }}>
                <div style={{ fontSize: 12, color: s.bg === "#0F1929" ? "rgba(255,255,255,0.5)" : "var(--c-text-3)", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.textColor, letterSpacing: "-0.5px", fontFamily: "'DM Mono',monospace" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: s.subColor, marginTop: 6 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>近6个月收入趋势</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
              {monthly.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--c-text-3)", fontFamily: "'DM Mono',monospace" }}>¥{v * 100}</div>
                  <div style={{ width: "100%", maxWidth: 48, height: Math.round((v / maxV) * 90) + "%", background: i === monthly.length - 1 ? "var(--c-mentor-accent)" : "var(--c-primary-bg)", borderRadius: "4px 4px 0 0", border: `1px solid ${i === monthly.length - 1 ? "var(--c-mentor-accent)" : "#91CAFF"}`, minHeight: 4, transition: "height 0.5s" }} />
                  <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>{monthLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "detail" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", overflow: "hidden" }}>
          <table className="ant-table">
            <thead><tr><th>学员</th><th>服务内容</th><th>日期</th><th>金额</th><th>状态</th></tr></thead>
            <tbody>
              {detail.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{r.student[0]}</div>
                      <span style={{ fontWeight: 500 }}>{r.student}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--c-text-2)" }}>{r.service}</td>
                  <td style={{ color: "var(--c-text-3)", fontFamily: "'DM Mono',monospace", fontSize: 13 }}>{r.date}</td>
                  <td style={{ fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>¥{r.amount.toLocaleString()}</td>
                  <td>
                    <span className={r.status === "待结算" ? "ant-tag ant-tag-orange" : "ant-tag ant-tag-green"}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "withdraw" && (
        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "var(--c-surface-2)", borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--c-text-2)" }}>可提现余额</span>
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>¥8,000</span>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 6 }}>提现金额</div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--c-text-2)", fontWeight: 600 }}>¥</span>
                <input type="number" className="ant-input" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft: 28, fontWeight: 700, fontSize: 16 }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {["1000","3000","5000","全部"].map(v => (
                  <button key={v} className="ant-btn ant-btn-default" style={{ padding: "3px 12px", fontSize: 12 }} onClick={() => setAmount(v === "全部" ? "8000" : v)}>
                    {v === "全部" ? "全部" : `¥${v}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 6 }}>收款账户</div>
              <div style={{ border: "1px solid var(--c-border-2)", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1677FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>支</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>支付宝</div>
                    <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>wang****@example.com</div>
                  </div>
                </div>
                <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)" }}>更换</button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--c-text-3)", background: "#FFFBE6", borderRadius: 8, padding: "10px 14px", lineHeight: 1.7 }}>
              · 提现将在 1–3 个工作日内到账<br/>
              · 单笔最低 ¥100，最高 ¥50,000<br/>
              · 如有问题请联系平台客服
            </div>

            <button className="ant-btn ant-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 15, fontWeight: 700 }}>
              确认提现 ¥{amount}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
