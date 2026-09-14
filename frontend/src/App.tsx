import { useState } from "react";
import MentorApp from "./pages/mentor";
import SupervisorApp from "./pages/supervisor";
import StudentApp from "./pages/student";
import AdminApp from "./pages/admin";

type Role = "mentor" | "supervisor" | "student" | "admin" | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);

  if (role === "mentor") return <MentorApp onBack={() => setRole(null)} />;
  if (role === "supervisor") return <SupervisorApp onBack={() => setRole(null)} />;
  if (role === "student") return <StudentApp onBack={() => setRole(null)} />;
  if (role === "admin") return <AdminApp onBack={() => setRole(null)} />;

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
          <span className="text-xl font-semibold tracking-tight text-[#0F172A]">求职辅导平台</span>
        </div>
        <h1 className="text-4xl font-bold text-[#0F172A] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
          专家交付平台 1.0
        </h1>
        <p className="text-[#64748B] text-lg">选择你的身份进入对应工作台</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl px-6">
        <RoleCard
          role="mentor"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="10" r="5" fill="#2563EB" fillOpacity="0.15"/>
              <circle cx="16" cy="10" r="5" stroke="#2563EB" strokeWidth="1.5"/>
              <path d="M6 26c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 4l2 2-2 2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          title="导师"
          subtitle="Expert Mentor"
          desc="接受项目、完成辅导、记录交付、查看收入"
          color="#2563EB"
          bgColor="#EFF6FF"
          onClick={() => setRole("mentor")}
        />
        <RoleCard
          role="supervisor"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="5" y="8" width="22" height="16" rx="2" fill="#7C3AED" fillOpacity="0.12" stroke="#7C3AED" strokeWidth="1.5"/>
              <path d="M5 13h22" stroke="#7C3AED" strokeWidth="1.5"/>
              <circle cx="10" cy="19" r="1.5" fill="#7C3AED"/>
              <circle cx="16" cy="19" r="1.5" fill="#7C3AED"/>
              <circle cx="22" cy="19" r="1.5" fill="#7C3AED"/>
            </svg>
          }
          title="运营"
          subtitle="Supervisor"
          desc="管理学员、分配项目、协调时间、跟进进度"
          color="#7C3AED"
          bgColor="#F5F3FF"
          onClick={() => setRole("supervisor")}
        />
        <RoleCard
          role="student"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L4 10l12 6 12-6-12-6z" fill="#0891B2" fillOpacity="0.15" stroke="#0891B2" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 13v7c2 2 5 3 8 3s6-1 8-3v-7" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M28 10v7" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
          title="学员"
          subtitle="Student"
          desc="查看辅导进度、预约课程、沟通导师、获取反馈"
          color="#0891B2"
          bgColor="#ECFEFF"
          onClick={() => setRole("student")}
        />
        <RoleCard
          role="admin"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="20" rx="2" fill="#059669" fillOpacity="0.12" stroke="#059669" strokeWidth="1.5"/>
              <path d="M4 12h24" stroke="#059669" strokeWidth="1.5"/>
              <circle cx="10" cy="9" r="1.5" fill="#059669"/>
              <circle cx="16" cy="9" r="1.5" fill="#059669"/>
              <path d="M8 18h8M8 22h12" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
          title="管理员"
          subtitle="Admin"
          desc="专家认证审核、平台配置、权限与数据管理"
          color="#059669"
          bgColor="#ECFDF5"
          onClick={() => setRole("admin")}
        />
      </div>

      <p className="mt-12 text-[#94A3B8] text-sm">© 2025 求职辅导平台 · V1.0</p>
    </div>
  );
}

function RoleCard({
  icon, title, subtitle, desc, color, bgColor, onClick,
}: {
  role: Role;
  icon: React.ReactNode;
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
      style={{ "--hover-color": color } as React.CSSProperties}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
      <div className="font-bold text-xl text-[#0F172A] mb-0.5">{title}</div>
      <div className="text-xs font-medium mb-3" style={{ color }}>{subtitle}</div>
      <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
      <div
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
        style={{ color }}
      >
        进入工作台
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ boxShadow: `0 0 0 2px ${color}30, 0 20px 40px ${color}15` }}
      />
    </button>
  );
}
