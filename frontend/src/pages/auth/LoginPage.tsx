import { useState } from "react";
import { login, registerExpert, type AuthUser } from "../../services/api";
import { useAuth, type AppRole } from "../../contexts/AuthContext";

const ROLE_LABEL: Record<AppRole, string> = {
  expert: "专家",
  ops: "运营",
  admin: "管理员",
  student: "学员",
};

interface LoginPageProps {
  role: AppRole;
  onSuccess: () => void;
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
    } catch {
      setError("网络错误，请确认后端已启动");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
        <button type="button" onClick={onBack} className="text-sm text-[#64748B] mb-6 hover:text-[#0F172A]">
          ← 返回角色选择
        </button>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">{ROLE_LABEL[role]}登录</h1>
        <p className="text-sm text-[#64748B] mb-6">
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
                  mode === m
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-[#64748B] border-[#E2E8F0]"
                }`}
              >
                {m === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#334155]">账号</span>
            <input
              className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={role === "admin" ? "admin" : "账号或手机号"}
              required
            />
          </label>

          {mode === "register" && role === "expert" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#334155]">姓名</span>
                <input
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#334155]">手机号（可选）</span>
                <input
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#334155]">密码</span>
            <input
              type="password"
              className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm"
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
            className="mt-2 py-2.5 rounded-lg bg-[#2563EB] text-white font-medium text-sm disabled:opacity-60"
          >
            {loading ? "处理中…" : mode === "register" ? "注册并进入" : "登录"}
          </button>
        </form>

        {role !== "expert" && (
          <p className="mt-4 text-xs text-[#94A3B8]">
            开发账号：admin/admin123 · ops1/ops123456
          </p>
        )}
      </div>
    </div>
  );
}
