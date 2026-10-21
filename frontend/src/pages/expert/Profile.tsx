import { useEffect, useState } from "react";
import {
  fetchMyExpertProfile,
  submitExpertCertification,
  type ExpertProfile,
} from "../../services/api";
import { labelExpertProfileStatus } from "../../utils/statusLabels";
import WorkExperienceSection from "./WorkExperienceSection";

type ProfileTab = "info" | "certification";

export default function Profile() {
  const [tab, setTab] = useState<ProfileTab>("info");
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [certMsg, setCertMsg] = useState("");

  useEffect(() => {
    fetchMyExpertProfile().then((res) => {
      if (res.success) setProfile(res.data);
    });
  }, []);

  async function handleSubmitCert() {
    setCertMsg("");
    const res = await submitExpertCertification();
    if (res.success) {
      setCertMsg("已提交，等待管理员审核");
      const refreshed = await fetchMyExpertProfile();
      if (refreshed.success) setProfile(refreshed.data);
    } else {
      setCertMsg(res.message);
    }
  }

  const displayName = profile?.realName || profile?.account || "专家";
  const status = profile?.profileStatus ?? "draft";

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>个人中心</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>查看个人资料和认证状态</div>
      </div>

      {/* Profile banner */}
      <div style={{ background: "#0F1929", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ height: 64, background: "linear-gradient(135deg, var(--c-mentor-accent) 0%, #FF8C5A 50%, #FFB347 100%)" }} />
        <div style={{ padding: "0 24px 20px", marginTop: -32, display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--c-mentor-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, border: "3px solid #0F1929", flexShrink: 0 }}>{displayName[0]}</div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{displayName}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
              {[profile?.currentTitle, profile?.currentCompany, profile?.city].filter(Boolean).join(" · ") || "专家"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <span style={{ background: status === "active" ? "#0D7A0D" : "#374151", color: status === "active" ? "#73D13D" : "#D1D5DB", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, border: "1px solid #237804" }}>
              {labelExpertProfileStatus(status)}
            </span>
            {profile?.acceptingProjects && (
              <span style={{ background: "rgba(22,119,255,0.2)", color: "#69B1FF", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(22,119,255,0.3)" }}>可接受项目</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>
        {([["info","个人资料"],["certification","认证信息"]] as [ProfileTab,string][]).map(([id, label]) => (
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
              {[["姓名", displayName],["手机号", profile?.phone ?? "—"],["账号", profile?.account ?? "—"],["所在城市", profile?.city ?? "—"],["当前公司", profile?.currentCompany ?? "—"],["当前职位", profile?.currentTitle ?? "—"]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <WorkExperienceSection
            items={profile?.workExperience}
            ready={profile !== null}
            onSaved={setProfile}
          />
        </div>
      )}

      {tab === "certification" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>认证状态：{labelExpertProfileStatus(status)}</div>
            {profile?.rejectReason && (
              <div style={{ fontSize: 13, color: "#B91C1C", marginBottom: 8 }}>拒绝原因：{profile.rejectReason}</div>
            )}
            {profile?.verifiedAt && (
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 12 }}>
                认证时间：{new Date(profile.verifiedAt).toLocaleString()}
              </div>
            )}
            {(status === "draft" || status === "rejected") && (
              <button
                type="button"
                onClick={handleSubmitCert}
                className="ant-btn ant-btn-primary"
                style={{ marginTop: 8 }}
              >
                提交认证申请
              </button>
            )}
            {certMsg && <div style={{ marginTop: 12, fontSize: 13, color: "var(--c-primary)" }}>{certMsg}</div>}
          </div>
        </div>
      )}

    </div>
  );
}
