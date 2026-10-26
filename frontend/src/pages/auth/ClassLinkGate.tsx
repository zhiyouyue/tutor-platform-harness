import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { redeemClassLink } from "../../services/api";

function classTokenFromLocation(): string | null {
  const value = new URLSearchParams(window.location.search).get("class");
  return value && value.length > 0 ? value : null;
}

interface Props {
  onEnter: () => void;
  children: (appointmentId: number | null) => ReactNode;
}

export default function ClassLinkGate({ onEnter, children }: Props) {
  const { login: saveAuth } = useAuth();
  const [classToken] = useState(classTokenFromLocation);
  const [boot, setBoot] = useState<"checking" | "ready" | "failed">(classToken ? "checking" : "ready");
  const [error, setError] = useState("");
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    if (!classToken) return;
    let cancelled = false;
    redeemClassLink(classToken).then((res) => {
      if (cancelled) return;
      if (!res.success || !res.data?.token || !res.data.user) {
        setError(res.message || "上课链接无效");
        setBoot("failed");
        return;
      }
      saveAuth(res.data.token, res.data.user);
      setAppointmentId(res.data.appointmentId);
      onEnter();
      setBoot("ready");
    }).catch(() => {
      if (cancelled) return;
      setError("网络异常，请稍后重试");
      setBoot("failed");
    });
    return () => {
      cancelled = true;
    };
  }, [classToken, onEnter, saveAuth]);

  if (boot === "checking") {
    return <div style={{ padding: 48, color: "var(--c-text-2)" }}>正在通过上课链接进入课堂…</div>;
  }

  if (boot === "failed") {
    return (
      <div style={{ padding: 48 }}>
        <p style={{ color: "var(--c-text-1)" }}>{error}</p>
        <button
          type="button"
          className="ant-btn ant-btn-default"
          onClick={() => {
            window.history.replaceState({}, "", window.location.pathname);
            setBoot("ready");
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  return children(appointmentId);
}
