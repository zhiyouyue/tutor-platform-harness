# 专家平台 Phase 1 主 PRD

- **文档版本**: v1.0-rc
- **日期**: 2025-09-14
- **阶段**: Phase 1（专家端 + 运营端 + 管理员端 + 学员轻量端）
- **状态**: Release Candidate — Blocking Q&A 已全部完成
- **Feature 前缀**: `FEAT-P1-*`
- **关联 ExecPlan**: [EP-001-expert-platform-phase1](../../exec-plans/active/EP-001-expert-platform-phase1.md)

---

## 1. 背景与目标

### 1.1 背景

公司求职辅导业务增长，专家交付依赖人工与微信。需建设**专家工作平台**，并配套**运营端**（派单协调）与**管理员端**（认证审核），形成可数据化的交付闭环。

### 1.2 Phase 1 目标

> 一个新专家能否独立完成：注册 → 完善资料 → 提交认证（管理员审核）→ 接收项目 → 查看学员 → 沟通/预约 → 辅导 → 记录 → 上传结果 → 完成节点 → 结束项目 → 查看收入账本。

同时运营能：创建学员/项目 → 定价派单 → 协调预约；管理员能：审核/拒绝专家认证。

### 1.3 成功指标

| 指标 | 目标 |
|------|------|
| 端到端闭环 | 标准测试场景（§规划说明-二十一）在 staging 跑通 |
| 三端 UI | 专家 / 运营 / 管理员核心页面与 Figma 对齐 |
| 权限隔离 | 运营无法审核专家；管理员无法替代运营派单（职责分离） |
| API 质量 | P0 接口有 JSON Schema + 集成测试 |

---

## 2. 用户与角色

| 角色 | 系统码 | Phase 1 | 说明 |
|------|--------|---------|------|
| 专家 / 导师 | `expert` | ✅ 完整 UI + API | 主交付角色 |
| 运营 | `ops` | ✅ 完整 UI + API | 学员/项目/派单/定价/协调；**无认证审核权** |
| 管理员 | `admin` | ✅ 完整 UI + API | 专家认证审核、禁用；**无运营派单职责** |
| 学员 | `student` | ✅ 轻量端 | 运营创建账号；短信/链接登录；仅交付空间 |

### 2.1 关键业务规则（PO 确认）

1. 专家：**开放注册** → 提交认证 → **仅管理员**可批准/拒绝
2. 定价：**运营在项目级定价**；专家接受前可见总价；不做专家自主定价
3. 沟通：项目交付空间支持 **专家↔运营、专家↔学员**
4. 学员：运营创建学员（含手机号）→ **短信/链接登录** → 进入项目交付空间
5. 会议：预约时间 + **阿里云 RTC 一对一视频**（已有能力；实施期封装适配器）
6. 收入 V1：**仅账本展示**，不做在线提现
7. **入账规则**：**项目完成**时入账 = 专家提交全部课件/交付内容 → **运营确认** → 记入专家账本

---

## 3. 产品边界

### 3.1 In Scope

**专家端**
- 注册/登录、资料、能力资产、认证提交、工作台
- 项目列表/详情/接受拒绝、节点、辅导记录、交付结果
- 交付空间（消息、文件）、会议预约、时间管理、收入账本、个人中心

**运营端**
- 学员 CRUD（含创建登录账号、触发短信/链接）、项目 CRUD、定价、派单
- 查看专家档期、创建/协调预约
- **项目完成确认**（专家提交交付后审核通过 → 触发入账）
- 交付空间（与专家/学员沟通）

**学员端（轻量）**
- 短信/链接登录（magic link 或 OTP）
- 项目交付空间：与专家消息、查看文件、加入视频辅导

**管理员端**
- 专家认证审核队列（通过/拒绝）
- 专家列表与状态管理（禁用等）
- 平台字典/配置（待 Q-010）
- 收入账本状态维护（若 V1 需手工标记结算）

### 3.2 Out of Scope

- 专家商城、自主接单、专家自主定价
- 在线提现、绑卡、打款
- AI 匹配、复杂 CRM、专家社区
- 自研视频会议（对接阿里云 RTC 即可）
- 学员完整 App（V1 仅交付空间）

---

## 4. 信息架构

### 4.1 专家端 `apps/expert`

```
/                          → 工作台
/projects                  → 我的项目
/projects/:id              → 项目详情
/projects/:id/delivery     → 交付空间
/profile                   → 资料与能力
/profile/certification     → 认证状态
/schedule                  → 我的时间
/income                    → 收入账本
/account                   → 个人中心
/auth/login | /auth/register
```

### 4.2 运营端 `apps/ops`

```
/                          → 运营工作台
/students                  → 学员管理
/students/:id              → 学员档案
/projects                  → 项目管理
/projects/new              → 创建项目（含定价、指定专家）
/projects/:id              → 项目详情/进度
/experts                   → 专家池（查看能力、档期）
/experts/:id/schedule      → 专家可辅导时间
/projects/:id/delivery     → 交付空间
/auth/login
```

### 4.3 管理员端 `apps/admin`

```
/                          → 管理首页
/experts/certifications    → 待审核专家队列
/experts                   → 专家列表
/experts/:id               → 专家详情/审核
/settings/dictionaries     → 字典配置（可选 P1）
/auth/login
```

### 4.4 学员端（轻量）`apps/student`

```
/auth/login                → 短信 OTP 或 magic link 落地
/auth/magic                → 链接 token 验证
/projects/:id/delivery     → 交付空间（消息/文件/入会）
```

> 路由以 [figma-mapping](./design/20250914-figma-mapping.md) 为准。

---

## 5. 功能需求摘要

| ID | 端 | 模块 | 优先级 |
|----|-----|------|--------|
| FR-P1-001 | expert | 开放注册、登录、会话 | P0 |
| FR-P1-002 | expert | 资料与能力资产 | P0 |
| FR-P1-003 | expert + admin | 认证提交（专家）/ 审核（管理员） | P0 |
| FR-P1-004 | expert | 工作台 | P0 |
| FR-P1-005 | expert | 项目列表、接受/拒绝 | P0 |
| FR-P1-006 | expert | 项目详情与节点 | P0 |
| FR-P1-007 | all | 交付空间（消息/文件/会议） | P1 |
| FR-P1-008 | expert | 辅导记录与交付结果 | P0 |
| FR-P1-009 | expert + ops | 时间管理、预约协调 | P1 |
| FR-P1-010 | expert | 收入账本（只读） | P1 |
| FR-P1-011 | expert | 个人中心 | P1 |
| FR-P1-OPS | ops | 学员/项目/派单/定价 | P0 |
| FR-P1-ADM | admin | 认证审核、专家管理 | P0 |
| FR-P1-STU | student | 短信/链接登录、交付空间 | P1 |
| FR-P1-CMP | expert + ops | 项目完成提交（专家）/ 确认（运营）/ 入账 | P0 |

---

## 6. 验收标准（Phase 1 Gate）

- [ ] **AC-P1-01**: 专家可开放注册并完成资料+能力填写，提交认证
- [ ] **AC-P1-02**: **管理员**可审核通过/拒绝；**运营无法**执行审核
- [ ] **AC-P1-03**: **运营**可创建学员+项目、定价、分配给专家
- [ ] **AC-P1-04**: 专家看到新项目，可接受/拒绝（可见运营定的总价）
- [ ] **AC-P1-05**: 专家可查看项目详情与学员档案
- [ ] **AC-P1-06**: 交付空间支持专家↔运营、专家↔学员消息
- [ ] **AC-P1-06b**: 运营创建学员后，学员可通过短信/链接登录交付空间
- [ ] **AC-P1-07**: 专家可完成节点：辅导记录 + 交付结果（课件/内容）
- [ ] **AC-P1-08**: 预约可发起阿里云 1v1 视频辅导
- [ ] **AC-P1-09**: 专家提交项目完成 → 运营确认 → 项目 `completed` → 专家账本入账
- [ ] **AC-P1-10**: 三端核心页面与 Figma 设计一致（已记录例外除外）
- [ ] **AC-P1-11**: P0 API 有 JSON Schema + 集成测试

---

## 7. 非功能需求

| 类别 | 要求 |
|------|------|
| 安全 | RBAC：`expert` / `ops` / `admin`；运营不能调用 admin 审核 API |
| API | Fastify + JSON Schema；routes → services → models |
| 前端 | React + Vite；三端可 monorepo 多入口或分 app |
| 会议 | `AliyunRtcMeetingProvider` 适配器；V1 一对一 |
| 短信 | 学员登录 OTP / magic link（阿里云短信或其他，实施期定） |
| 文件 | 建议阿里云 OSS（与 RTC 同云）；待 Q-007 确认 |

---

## 8. 核心实体关系

```
User 1──1 RoleAssignment (expert|ops|admin)
Expert 1──* ExpertCapability
Expert 1──1 ExpertCertification
Student 1──* Project
Project 1──* ProjectNode
Project 1──* CoachingRecord
Project 1──* Deliverable
Project 1──* Message
Project 1──* File
Project 1──* Appointment ── MeetingRoom (external ref)
Project 1──* IncomeLine
Project 1──1 ProjectCompletion (expert_submit → ops_confirm)
Student 1──1 User (phone login)
OpsUser *──* Project (created_by)
```

---

## 9. 依赖

| 依赖 | 状态 |
|------|------|
| Figma 专家端/运营端 | PO Figma AI 生成中 |
| Figma 管理员端 | **待 PO 设计** |
| 阿里云 RTC | 已有 1v1 能力；**无文档** — IMPLEMENT 前获取 SDK/现有代码 |
| 阿里云短信 | 学员登录（实施期配置） |
| 文件存储 OSS | 建议阿里云；待 Q-007 正式确认 |

---

## 10. 变更记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2025-09-14 | v0.1-draft | 初稿 |
| 2025-09-14 | v0.2-draft | PO 答复 Q-001~006；三端 UI；运营/管理员分权 |
| 2025-09-14 | v1.0-rc | Q-004-FU~006-FU；学员轻量端；阿里云 RTC；项目完成双确认入账 |
