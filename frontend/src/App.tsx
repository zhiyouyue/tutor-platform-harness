import { useState } from "react";
import ExpertApp from "./pages/expert";
import OpsApp from "./pages/ops";
import StudentApp from "./pages/student";
import AdminApp from "./pages/admin";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider, useAuth, type AppRole } from "./contexts/AuthContext";

type UiRole = "expert" | "ops" | "student" | "admin" | null;

const UI_TO_AUTH: Record<Exclude<UiRole, null>, AppRole> = {
  expert: "expert",
  ops: "ops",
  student: "student",
  admin: "admin",
};

const ROLE_THEMES = {
  expert: { accent: "var(--c-blue-600)", soft: "var(--c-blue-100)" },
  ops: { accent: "var(--c-blue-800)", soft: "var(--c-blue-50)" },
  student: { accent: "var(--c-blue-500)", soft: "var(--c-primary-soft)" },
  admin: { accent: "var(--c-blue-900)", soft: "var(--c-blue-100)" },
} as const;

function AppInner() {
  const { role: authRole, logout, token } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UiRole>(null);
  const [entered, setEntered] = useState(false);

  const authTarget = selectedRole ? UI_TO_AUTH[selectedRole] : null;

  function handleBack() {
    logout();
    setSelectedRole(null);
    setEntered(false);
  }

  if (selectedRole && authTarget) {
    const canEnter = entered || (token && authRole === authTarget);
    if (!canEnter) {
      return (
        <LoginPage
          role={authTarget}
          onSuccess={() => setEntered(true)}
          onBack={() => setSelectedRole(null)}
        />
      );
    }
    if (selectedRole === "expert") return <ExpertApp onBack={handleBack} />;
    if (selectedRole === "ops") return <OpsApp onBack={handleBack} />;
    if (selectedRole === "student") return <StudentApp onBack={handleBack} />;
    if (selectedRole === "admin") return <AdminApp onBack={handleBack} />;
  }

  return (
    <div className="auth-page-bg min-h-screen flex flex-col items-center justify-center px-6">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "var(--c-blue-600)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 6v5c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V6L11 2z" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight" style={{ color: "var(--c-text-1)" }}>
            职优越导师
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight" style={{ color: "var(--c-blue-deep)" }}>
          欢迎登录
        </h1>
        <p className="text-lg" style={{ color: "var(--c-text-3)" }}>请选择您的身份</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
        <RoleCard
          title="专家"
          subtitle="Expert"
          desc="注册登录、完善资料、提交认证、接受项目"
          theme={ROLE_THEMES.expert}
          onClick={() => setSelectedRole("expert")}
        />
        <RoleCard
          title="运营"
          subtitle="Ops"
          desc="管理学员、分配项目、协调时间、跟进进度"
          theme={ROLE_THEMES.ops}
          onClick={() => setSelectedRole("ops")}
        />
        <RoleCard
          title="学员"
          subtitle="Student"
          desc="查看课程、进入课堂、和导师沟通"
          theme={ROLE_THEMES.student}
          onClick={() => setSelectedRole("student")}
        />
        <RoleCard
          title="管理员"
          subtitle="Admin"
          desc="审核专家认证、查看项目数量"
          theme={ROLE_THEMES.admin}
          onClick={() => setSelectedRole("admin")}
        />
      </div>

      <p className="mt-12 text-sm" style={{ color: "var(--c-text-4)" }}>© {new Date().getFullYear()} 求职辅导平台 · V1.0</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function RoleCard({
  title,
  subtitle,
  desc,
  theme,
  onClick,
}: {
  title: string;
  subtitle: string;
  desc: string;
  theme: { accent: string; soft: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative text-left cursor-pointer transition-all duration-200 surface-card p-7 hover:shadow-lg"
      style={{ borderColor: "var(--c-border)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105"
        style={{ background: theme.soft }}
      >
        <div className="w-7 h-7 rounded-full opacity-90" style={{ background: theme.accent }} />
      </div>
      <div className="font-bold text-xl mb-0.5" style={{ color: "var(--c-text-1)" }}>{title}</div>
      <div className="text-xs font-semibold mb-3 tracking-wide" style={{ color: theme.accent }}>{subtitle}</div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-3)" }}>{desc}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: theme.accent }}>
        登录进入
        <span aria-hidden>→</span>
      </div>
    </button>
  );
}
