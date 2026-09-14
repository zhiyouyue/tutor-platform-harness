import { useState } from "react";

type ProfileTab = "info"|"certification"|"payment"|"settings";

export default function Profile() {
  const [tab, setTab] = useState<ProfileTab>("info");
  const [notifications, setNotifications] = useState({ newProject:true, projectReminder:true, studentMessage:true, meetingReminder:true, operationMessage:false });

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>个人中心</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>管理你的账号信息和系统设置</div>
      </div>

      {/* Profile banner */}
      <div style={{ background: "#0F1929", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ height: 64, background: "linear-gradient(135deg, var(--c-mentor-accent) 0%, #FF8C5A 50%, #FFB347 100%)" }} />
        <div style={{ padding: "0 24px 20px", marginTop: -32, display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--c-mentor-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, border: "3px solid #0F1929", flexShrink: 0 }}>王</div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>王明华</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>高级产品经理 · 某互联网科技公司 · 8年经验</div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <span style={{ background: "#0D7A0D", color: "#73D13D", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, border: "1px solid #237804" }}>✓ 已认证</span>
            <span style={{ background: "rgba(22,119,255,0.2)", color: "#69B1FF", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(22,119,255,0.3)" }}>可接受项目</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>
        {([["info","个人资料"],["certification","认证信息"],["payment","收款设置"],["settings","账号设置"]] as [ProfileTab,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", fontSize: 14, cursor: "pointer", background: "transparent", border: "none",
            borderBottom: tab === id ? "2px solid var(--c-mentor-accent)" : "2px solid transparent",
            color: tab === id ? "var(--c-mentor-accent)" : "var(--c-text-2)",
            fontWeight: tab === id ? 600 : 400, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>基础信息</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 }}>
              {[["姓名","王明华"],["手机号","138****8888"],["邮箱","wang@example.com"],["所在城市","上海"],["当前公司","某互联网科技公司"],["当前职位","高级产品经理"]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>工作经历</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { co:"某互联网科技公司", role:"高级产品经理", period:"2022.03 – 至今" },
                { co:"某头部创业公司", role:"产品负责人", period:"2019.06 – 2022.02" },
                { co:"某BAT公司", role:"产品经理", period:"2017.07 – 2019.05" },
              ].map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-surface-2)", borderRadius: 8, border: "1px solid var(--c-border)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{e.co[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.role}</div>
                    <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{e.co} · {e.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "certification" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#F6FFED", border: "1px solid #B7EB8F", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--c-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l3 3 9-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#237804", fontSize: 15 }}>认证状态：已通过</div>
              <div style={{ fontSize: 12, color: "#52C41A", marginTop: 2 }}>认证时间：2025-07-10 · 有效期至 2026-07-10 · 审核人：平台运营团队</div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>认证材料</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name:"身份证件（正面）", status:"已验证", icon:"🪪" },
                { name:"工作证明或名片", status:"已验证", icon:"💼" },
                { name:"学历证明", status:"已验证", icon:"🎓" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-surface-2)", borderRadius: 8, border: "1px solid var(--c-border)" }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                  <span className="ant-tag ant-tag-green">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "payment" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>收款账户</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name:"支付宝", account:"wang****@example.com", icon:"支", color:"#1677FF", primary:true },
              { name:"微信支付", account:"未绑定", icon:"微", color:"#07C160", primary:false },
              { name:"银行卡", account:"**** **** **** 8888", icon:"银", color:"#FAAD14", primary:false },
            ].map((acc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: "1px solid var(--c-border)", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: acc.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{acc.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{acc.name}</span>
                    {acc.primary && <span className="ant-tag ant-tag-blue" style={{ fontSize: 11 }}>主要</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{acc.account}</div>
                </div>
                <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)" }}>
                  {acc.account === "未绑定" ? "绑定" : "管理"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>消息通知</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {([ ["newProject","新项目通知"],["projectReminder","项目提醒"],["studentMessage","学员消息"],["meetingReminder","会议提醒"],["operationMessage","运营消息"] ] as [keyof typeof notifications, string][]).map(([key, label], i, arr) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                  <span style={{ fontSize: 14 }}>{label}</span>
                  <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                    background: notifications[key] ? "var(--c-mentor-accent)" : "var(--c-border-2)",
                  }}>
                    <div style={{ position: "absolute", width: 16, height: 16, background: "#fff", borderRadius: "50%", top: 3, left: notifications[key] ? "calc(100% - 19px)" : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>账号安全</div>
            {[
              { label:"修改密码", desc:"上次修改于 60 天前" },
              { label:"绑定手机", desc:"138****8888" },
              { label:"登录记录", desc:"查看近期登录历史" },
            ].map((item, i, arr) => (
              <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-border)" : "none", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="var(--c-text-3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            ))}
          </div>

          <button className="ant-btn ant-btn-default" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 14, color: "var(--c-danger)", borderColor: "var(--c-danger-border)" }}>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
