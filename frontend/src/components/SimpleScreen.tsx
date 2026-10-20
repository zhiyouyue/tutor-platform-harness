/** 面向普通用户的极简页面框架 */
export function SimpleScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--c-text-1)" }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--c-text-3)", lineHeight: 1.5 }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SimpleCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--c-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--c-border)",
        boxShadow: "var(--shadow-card)",
        padding: 18,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        border: "none",
        borderRadius: 10,
        background: disabled ? "var(--c-border-2)" : "var(--c-primary)",
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
