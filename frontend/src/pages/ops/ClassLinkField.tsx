import { useState } from "react";

interface Props {
  classPath: string | null;
}

export default function ClassLinkField({ classPath }: Props) {
  const [copied, setCopied] = useState(false);
  if (!classPath) return <span style={{ color: "var(--c-text-4)" }}>—</span>;

  const url = `${window.location.origin}${classPath}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, maxWidth: 280 }}>
      <input
        readOnly
        value={url}
        aria-label="上课链接"
        onFocus={(e) => e.currentTarget.select()}
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          padding: "4px 6px",
          border: "1px solid var(--c-border)",
          borderRadius: 6,
          color: "var(--c-text-2)",
          background: "var(--c-surface)",
        }}
      />
      <button type="button" className="ant-btn ant-btn-link" style={{ fontSize: 12 }} onClick={() => void copy()}>
        {copied ? "已复制" : "复制"}
      </button>
    </div>
  );
}
