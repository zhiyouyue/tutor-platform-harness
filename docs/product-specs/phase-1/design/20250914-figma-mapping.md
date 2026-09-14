# Figma 设计稿映射（Phase 1 · 三端）

- **日期**: 2025-09-14
- **Figma（专家端）**: [导师交付平台页面构建](https://www.figma.com/make/MfIVBGqdynOMIZDy9W2Sdf/%E5%AF%BC%E5%B8%88%E4%BA%A4%E4%BB%98%E5%B9%B3%E5%8F%B0%E9%A1%B5%E9%9D%A2%E6%9E%84%E5%BB%BA)
- **运营端 / 管理员端**: PO 使用 Figma AI 生成（链接待补充）
- **状态**: 待 Frame 清单 + 查看权限

---

## 设计产出计划（PO）

| 端 | Figma 状态 | 说明 |
|----|------------|------|
| 专家端 | 已有/生成中 | 原 Figma Make 链接 |
| 运营端 | Figma AI 生成 | 学员/项目/派单/协调 |
| 管理员端 | **待设计** | 认证审核、专家管理 |

---

## 1. 专家端 `apps/expert`

| Figma Frame | 路由 | Feature | 组件路径（计划） | 状态 |
|-------------|------|---------|------------------|------|
| 登录 | `/auth/login` | FEAT-P1-001 | `apps/expert/pages/auth/Login.tsx` | 待对齐 |
| 注册 | `/auth/register` | FEAT-P1-001 | `apps/expert/pages/auth/Register.tsx` | 待对齐 |
| 工作台 | `/` | FEAT-P1-004 | `apps/expert/pages/dashboard/` | 待对齐 |
| 我的项目 | `/projects` | FEAT-P1-005 | `apps/expert/pages/projects/` | 待对齐 |
| 项目详情 | `/projects/:id` | FEAT-P1-006 | `apps/expert/pages/projects/Detail.tsx` | 待对齐 |
| 交付空间 | `/projects/:id/delivery` | FEAT-P1-007 | `apps/expert/pages/projects/Delivery.tsx` | 待对齐 |
| 我的能力 | `/profile` | FEAT-P1-002 | `apps/expert/pages/profile/` | 待对齐 |
| 认证 | `/profile/certification` | FEAT-P1-003 | `apps/expert/pages/profile/Certification.tsx` | 待对齐 |
| 我的时间 | `/schedule` | FEAT-P1-009 | `apps/expert/pages/schedule/` | 待对齐 |
| 我的收入 | `/income` | FEAT-P1-010 | `apps/expert/pages/income/` | 待对齐 |
| 个人中心 | `/account` | FEAT-P1-011 | `apps/expert/pages/account/` | 待对齐 |

> 提现页 **不在 V1**（Q-006 仅账本）。

---

## 2. 运营端 `apps/ops`

| Figma Frame | 路由 | Feature | 组件路径（计划） | 状态 |
|-------------|------|---------|------------------|------|
| 登录 | `/auth/login` | FEAT-P1-OPS | `apps/ops/pages/auth/Login.tsx` | 待 Figma |
| 工作台 | `/` | FEAT-P1-OPS | `apps/ops/pages/dashboard/` | 待 Figma |
| 学员列表 | `/students` | FEAT-P1-OPS | `apps/ops/pages/students/` | 待 Figma |
| 学员档案 | `/students/:id` | FEAT-P1-OPS | `apps/ops/pages/students/Detail.tsx` | 待 Figma |
| 项目列表 | `/projects` | FEAT-P1-OPS | `apps/ops/pages/projects/` | 待 Figma |
| 创建项目 | `/projects/new` | FEAT-P1-OPS | `apps/ops/pages/projects/Create.tsx` | 待 Figma |
| 项目详情 | `/projects/:id` | FEAT-P1-OPS | `apps/ops/pages/projects/Detail.tsx` | 待 Figma |
| 专家池 | `/experts` | FEAT-P1-OPS | `apps/ops/pages/experts/` | 待 Figma |
| 专家档期 | `/experts/:id/schedule` | FEAT-P1-OPS | `apps/ops/pages/experts/Schedule.tsx` | 待 Figma |
| 交付空间 | `/projects/:id/delivery` | FEAT-P1-007 | `apps/ops/pages/projects/Delivery.tsx` | 待 Figma |

---

## 3. 学员端（轻量）`apps/student`

| Figma Frame | 路由 | Feature | 组件路径（计划） | 状态 |
|-------------|------|---------|------------------|------|
| 登录（短信/链接） | `/auth/login` | FEAT-P1-STU | `apps/student/pages/auth/Login.tsx` | 待 Figma |
| Magic Link 落地 | `/auth/magic` | FEAT-P1-STU | `apps/student/pages/auth/Magic.tsx` | 待 Figma |
| 交付空间 | `/projects/:id/delivery` | FEAT-P1-STU | `apps/student/pages/delivery/` | 待 Figma |
| 视频辅导 | 交付空间内嵌 | FEAT-P1-009 | `apps/student/components/RtcRoom.tsx` | 待 Figma |

> V1 学员端页面少，可与专家端交付空间共用 Figma 组件。

---

## 4. 管理员端 `apps/admin`

| Figma Frame | 路由 | Feature | 组件路径（计划） | 状态 |
|-------------|------|---------|------------------|------|
| 登录 | `/auth/login` | FEAT-P1-ADM | `apps/admin/pages/auth/Login.tsx` | **待设计** |
| 首页 | `/` | FEAT-P1-ADM | `apps/admin/pages/dashboard/` | **待设计** |
| 认证审核队列 | `/experts/certifications` | FEAT-P1-003 | `apps/admin/pages/experts/Certifications.tsx` | **待设计** |
| 专家详情/审核 | `/experts/:id` | FEAT-P1-003 | `apps/admin/pages/experts/Detail.tsx` | **待设计** |
| 专家列表 | `/experts` | FEAT-P1-ADM | `apps/admin/pages/experts/` | **待设计** |

---

## 5. 共享

| 资源 | 路径 |
|------|------|
| UI 组件库 | `frontend/src/components/ui/` |
| 设计 Token | `frontend/src/styles/tokens.css` |
| API Client | `frontend/src/services/api.ts` |

---

## 6. Figma AI 协作建议（给 PO）

生成运营端/管理员端时，建议 Prompt 包含：

1. 角色边界：运营=派单定价；管理员=审核专家，不能派单
2. 核心页面清单（见上表）
3. 与专家端统一的设计系统（色板、字体、组件）
4. 导出 Frame 名称列表粘贴到本文件

---

## 7. 偏差记录

| 日期 | 页面 | 偏差 | 原因 |
|------|------|------|------|
| | | | |
