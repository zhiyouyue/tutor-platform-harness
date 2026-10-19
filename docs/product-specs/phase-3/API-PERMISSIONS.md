# 接口权限矩阵（Phase 3）

> 前缀：`/api/v1`（RTC 为 `/api/rtc`）。**鉴权**：`Authorization: Bearer <JWT>`，除注明「公开」外均需登录。  
> **项目级**：带 `projectId` 的接口另走 `requireProjectAccess`（仅该项目 admin / 负责 ops / 分配 expert / 对应 student）。

## 图例

| 符号 | 含义 |
|------|------|
| ✅ | 该角色可调用 |
| 🔒 | 需项目归属校验 |
| ⛔ | 禁止（应返回 403） |
| — | 不适用 |

## 公开 / 健康

| 方法 | 路径 | admin | ops | expert | student | 说明 |
|------|------|-------|-----|--------|---------|------|
| GET | `/health` | — | — | — | — | 无需登录 |
| POST | `/auth/register` | — | — | ✅* | — | *仅专家注册 |
| POST | `/auth/login` | ✅ | ✅ | ✅ | ✅ | |
| GET | `/auth/student/magic` | — | — | — | — | 魔法链接换 token |

## 认证与用户

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/auth/me` | ✅ | ✅ | ✅ | ✅ |

## 管理员 — 专家审核

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/admin/experts/certifications` | ✅ | ⛔ | ⛔ | ⛔ |
| POST | `/admin/experts/:id/certification/approve` | ✅ | ⛔ | ⛔ | ⛔ |
| POST | `/admin/experts/:id/certification/reject` | ✅ | ⛔ | ⛔ | ⛔ |
| GET | `/admin/dashboard/by-expert` | ✅ | ⛔ | ⛔ | ⛔ |

## 班主任（ops）

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/ops/dashboard` | ⛔ | ✅ | ⛔ | ⛔ |
| GET | `/ops/students` | ⛔ | ✅† | ⛔ | ⛔ |
| POST | `/ops/students` | ⛔ | ✅ | ⛔ | ⛔ |
| POST | `/ops/students/import` | ⛔ | ✅ | ⛔ | ⛔ |
| GET | `/ops/students/:id` | ⛔ | ✅† | ⛔ | ⛔ |
| POST | `/ops/students/:id/send-login-link` | ⛔ | ✅† | ⛔ | ⛔ |
| GET | `/ops/experts` | ⛔ | ✅ | ⛔ | ⛔ |
| GET | `/ops/experts/:id/schedule-slots` | ⛔ | ✅ | ⛔ | ⛔ |
| GET | `/ops/projects` | ⛔ | ✅‡ | ⛔ | ⛔ |
| GET | `/ops/projects/:id` | ⛔ | 🔒 | ⛔ | ⛔ |
| PATCH | `/ops/projects/:id` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/projects` | ⛔ | ✅ | ⛔ | ⛔ |
| POST | `/ops/projects/:id/publish` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/projects/:id/appointments` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/projects/:id/appointments/from-slot` | ⛔ | 🔒 | ⛔ | ⛔ |
| GET | `/ops/appointments` | ⛔ | ✅‡ | ⛔ | ⛔ |
| PATCH | `/ops/appointments/:id` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/appointments/:id/reschedule` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/appointments/:id/defer` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/appointments/:id/mark-incomplete` | ⛔ | 🔒 | ⛔ | ⛔ |
| GET | `/ops/appointments/:id/completion-record` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/appointments/:id/confirm-completion` | ⛔ | 🔒 | ⛔ | ⛔ |
| POST | `/ops/projects/:id/completion/confirm` | ⛔ | 🔒 | ⛔ | ⛔ |
| GET | `/ops/finance/summary` | ⛔ | ✅ | ⛔ | ⛔ |

† 仅负责项目关联的学生（Phase 3）  
‡ 列表按 `ops_user_id = 当前班主任` 过滤

## 专家

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/dashboard` | ⛔ | ⛔ | ✅ | ⛔ |
| GET/PATCH | `/experts/me/profile` | ⛔ | ⛔ | ✅ | ⛔ |
| GET/POST | `/experts/me/certification/*` | ⛔ | ⛔ | ✅ | ⛔ |
| GET/PUT | `/experts/me/capabilities` | ⛔ | ⛔ | ✅ | ⛔ |
| GET/PUT | `/experts/me/schedule` | ⛔ | ⛔ | ✅ | ⛔ |
| POST | `/experts/me/schedule/blackouts` | ⛔ | ⛔ | ✅ | ⛔ |
| GET | `/experts/me/appointments` | ⛔ | ⛔ | ✅ | ⛔ |
| GET | `/projects` | ⛔ | ⛔ | ✅ | ⛔ |
| GET | `/projects/:id` | ⛔ | ⛔ | 🔒 | ⛔ |
| POST | `/projects/:id/accept` | ⛔ | ⛔ | 🔒 | ⛔ |
| POST | `/projects/:id/appointments/:apptId/expert-complete` | ⛔ | ⛔ | 🔒 | ⛔ |
| GET/POST | `/projects/:id/coaching-records` 等交付 | ⛔ | ⛔ | 🔒 | ⛔ |
| GET | `/income/summary` | ⛔ | ⛔ | ✅ | ⛔ |

## 学员

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/student/projects` | ⛔ | ⛔ | ⛔ | ✅ |
| GET | `/student/appointments` | ⛔ | ⛔ | ⛔ | ✅ |

## 课次 / 课堂（多角色 + 项目校验）

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| POST | `/appointments/:id/join-classroom` | 🔒 | 🔒 | 🔒 | 🔒 |
| GET | `/appointments/:id/recordings` | 🔒 | 🔒 | 🔒 | 🔒 |
| GET | `/appointments/:id/completion-record` | 🔒 | 🔒 | 🔒 | 🔒 |

## 站内通知（全角色）

| 方法 | 路径 | admin | ops | expert | student |
|------|------|-------|-----|--------|---------|
| GET | `/notifications` | ✅ | ✅ | ✅ | ✅ |
| PATCH | `/notifications/:id/read` | ✅ | ✅ | ✅ | ✅ |

## RTC 直连（专家/学员用户）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/rtc/sessions` | 登录用户；1v1 呼叫 |
| POST | `/api/rtc/sessions/:channelId/join` | 会话参与者 |

## 内部（无 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/internal/rtc/recording-callback` | Header `x-rtc-callback-secret` |

## 自动化验收

- `tests/integration/auth.test.ts` — 注册登录  
- `tests/integration/rbac-ops-scope.test.ts` — 班主任跨项目 403  
- `tests/integration/phase3-po-decisions.test.ts` — Q-P3-03~09  
- E2E `AC-P1-02` — ops 不可调 admin API  

维护：新增 route 时同步更新本表。
