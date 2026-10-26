import { useState } from "react";
import { login, registerExpert, type AuthUser } from "../../services/api";
import { useAuth, type AppRole } from "../../contexts/AuthContext";
import StudentLinkLogin from "./StudentLinkLogin";

const ROLE_LABEL: Record<AppRole, string> = {
  expert: "专家",
  ops: "运营",
  admin: "管理员",
  student: "学员",
};

interface LoginPageProps {
  role: AppRole;
  onSuccess: (appointmentId?: number) => void;
  onBack: () => void;
}

export default function LoginPage({ role, onSuccess, onBack }: LoginPageProps) {
  const { login: saveAuth } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(role === "expert" ? "login" : "login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (mode === "register" && role === "expert") {
        res = await registerExpert({ account, password, phone: phone || undefined, realName: realName || undefined });
      } else {
        res = await login(account, password);
      }
      if (!res.success) {
        setError(res.message || "登录失败");
        return;
      }
      const data = res.data as { token: string; user: AuthUser };
      if (data.user.role !== role) {
        setError(`该账号角色为「${ROLE_LABEL[data.user.role as AppRole] ?? data.user.role}」，请从对应入口登录`);
        return;
      }
      saveAuth(data.token, data.user);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg && !/fetch|network/i.test(msg) ? msg : "网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md surface-card p-8" style={{ boxShadow: "var(--shadow-drop)" }}>
        <button type="button" onClick={onBack} className="text-sm mb-6 ant-btn-text" style={{ padding: 0 }}>
          ← 返回角色选择
        </button>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--c-blue-deep)" }}>{ROLE_LABEL[role]}登录</h1>
        <p className="text-sm mb-6" style={{ color: "var(--c-text-3)" }}>
          {role === "expert" ? "专家开放注册，提交资料后需管理员审核" : "使用已分配账号登录"}
        </p>

        {role === "expert" && (
          <div className="flex gap-2 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm rounded-lg border ${
                  mode === m ? "ant-btn-primary" : "ant-btn-default"
                }`}
                style={{ justifyContent: "center" }}
              >
                {m === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--c-text-2)" }}>账号</span>
            <input
              className="ant-input"
              name="username"
              autoComplete="username"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入账号"
              required
            />
          </label>

          {mode === "register" && role === "expert" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium" style={{ color: "var(--c-text-2)" }}>姓名</span>
                <input
                  className="ant-input"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium" style={{ color: "var(--c-text-2)" }}>手机号（可选）</span>
                <input
                  className="ant-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--c-text-2)" }}>密码</span>
            <input
              type="password"
              className="ant-input"
              name="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 ant-btn ant-btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "处理中…" : mode === "register" ? "注册并进入" : "登录"}
          </button>
        </form>

        {role === "student" && <StudentLinkLogin onSuccess={onSuccess} />}

      </div>
    </div>
  );
}
