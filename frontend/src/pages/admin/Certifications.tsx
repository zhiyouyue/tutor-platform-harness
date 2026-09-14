export default function Certifications() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>专家认证</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>
          审核导师认证申请，管理平台专家资质
        </div>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px dashed var(--c-border-2)",
        padding: 60,
        textAlign: "center",
        color: "var(--c-text-3)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--c-text-2)", marginBottom: 8 }}>
          管理员端 · 专家认证模块
        </div>
        <div style={{ fontSize: 14, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          此模块尚未在 Figma 设计中完成，后续将支持认证申请列表、审核流程与资质管理。
        </div>
      </div>
    </div>
  );
}
