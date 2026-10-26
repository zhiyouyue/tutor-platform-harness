import { useState } from "react";
import { redeemClassLink, verifyMagicLink } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { extractClassToken } from "./classToken";

interface Props {
  onSuccess: (appointmentId?: number) => void;
}

export default function StudentLinkLogin({ onSuccess }: Props) {
  const { login: saveAuth } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function enter() {
    setLoading(true);
    setError("");
    const raw = value.trim();
    const classToken = extractClassToken(raw);
    if (classToken) {
      const res = await redeemClassLink(classToken);
      if (!res.success || !res.data?.token || !res.data.user) {
        setError(res.message || "上课链接无效");
        setLoading(false);
        return;
      }
      saveAuth(res.data.token, res.data.user);
      onSuccess(res.data.appointmentId);
      setLoading(false);
      return;
    }
    const res = await verifyMagicLink(raw);
    if (!res.success || !res.data?.token || !res.data.user) {
      setError(res.message || "链接无效");
      setLoading(false);
      return;
    }
    saveAuth(res.data.token, res.data.user);
    onSuccess();
    setLoading(false);
  }

  return (
    <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--c-border)" }}>
      <p className="text-sm font-medium mb-2" style={{ color: "var(--c-text-2)" }}>上课链接</p>
      <input
        className="ant-input mb-2"
        type="text"
        autoComplete="off"
        placeholder="粘贴上课链接"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button
        type="button"
        disabled={loading || !value.trim()}
        className="w-full ant-btn ant-btn-default justify-center"
        style={{ color: "var(--c-primary)", borderColor: "var(--c-blue-400)" }}
        onClick={() => void enter()}
      >
        进入课堂
      </button>
    </div>
  );
}
