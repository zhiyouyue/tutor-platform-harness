import { useAuth } from "../../contexts/AuthContext";

function maskPhone(phone: string | null | undefined) {
  if (!phone) return "未绑定";
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 7) return "已绑定";
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

export default function StudentProfile() {
  const { user } = useAuth();
  const name = user?.account || user?.phone || "学员";

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ borderRadius: 16, padding: 20, background: "linear-gradient(135deg, var(--c-blue-800), var(--c-blue-500))", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>{name.slice(0, 1)}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>学员</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>基本信息</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10 }}>
          {[["账号", user?.account || "—"], ["手机号", maskPhone(user?.phone)]].map(([l, v]) => (
            <div key={l} style={{ padding: "10px 12px", background: "var(--c-surface-2)", borderRadius: 8, border: "1px solid var(--c-border)" }}>
              <div style={{ fontSize: 11, color: "var(--c-text-3)", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
