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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA]">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 6v5c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V6L11 2z" fill="white" fillOpacity="0.9"/>
              <circle cx="11" cy="10" r="3" fill="#2563EB"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#0F172A]">职优越导师</span>
        </div>
        <h1 className="text-4xl font-bold text-[#0F172A] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
          欢迎登录
        </h1>
        <p className="text-[#64748B] text-lg">请选择您的身份</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl px-6">
        <RoleCard
          title="专家"
          subtitle="Expert"
          desc="注册登录、完善资料、提交认证、接受项目"
          color="#2563EB"
          bgColor="#EFF6FF"
          onClick={() => setSelectedRole("expert")}
        />
        <RoleCard
          title="运营"
          subtitle="Ops"
          desc="管理学员、分配项目、协调时间、跟进进度"
          color="#7C3AED"
          bgColor="#F5F3FF"
          onClick={() => setSelectedRole("ops")}
        />
        <RoleCard
          title="学员"
          subtitle="Student"
          desc="查看辅导进度、预约课程、沟通专家"
          color="#0891B2"
          bgColor="#ECFEFF"
          onClick={() => setSelectedRole("student")}
        />
        <RoleCard
          title="管理员"
          subtitle="Admin"
          desc="专家认证审核、平台配置、权限管理"
          color="#059669"
          bgColor="#ECFDF5"
          onClick={() => setSelectedRole("admin")}
        />
      </div>

      <p className="mt-12 text-[#94A3B8] text-sm">© 2025 求职辅导平台 · V1.0</p>
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
  title, subtitle, desc, color, bgColor, onClick,
}: {
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-7 text-left border border-[#E2E8F0] hover:border-transparent hover:shadow-xl transition-all duration-200 cursor-pointer"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: bgColor }}
      >
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color, opacity: 0.8 }} />
      </div>
      <div className="font-bold text-xl text-[#0F172A] mb-0.5">{title}</div>
      <div className="text-xs font-medium mb-3" style={{ color }}>{subtitle}</div>
      <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
        登录进入
        <span>→</span>
      </div>
    </button>
  );
}
