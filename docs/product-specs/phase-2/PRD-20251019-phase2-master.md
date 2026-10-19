# 导师平台 Phase 2 主 PRD

- **文档版本**: v1.1
- **日期**: 2025-10-19
- **阶段**: Phase 2（课程闭环 + 阿里云 RTC 入会 + 云录制 OSS + 课次双确认入账）
- **状态**: **已批准** — PO 决策见 [20251019-po-decisions-log](./design/20251019-po-decisions-log.md)
- **数据库**: 延续 `expert_platform`（增量 migration `backend/sql/04_phase2_course_extensions.sql`）
- **Feature 前缀**: `FEAT-P2-*`
- **ExecPlan**: [EP-002-tutor-platform-phase2](../../exec-plans/active/EP-002-tutor-platform-phase2.md)

---

## 1. 背景与目标

### 1.1 背景

Phase 1 已跑通 **专家入驻 → 运营派单 → 交付 → 双确认入账**（见 `test/phase1/SUMMARY.md`）。PO 第二阶段矩阵强调 **以「课程/课次」为中心的排课、上课链接与完成确认**，并补齐学员端「我的课程」真实数据。

### 1.2 Phase 2 目标

> 班主任从专家 **可选 time-slot** 排课并生成 **平台 RTC 入会能力**；专家/学员在平台内 **阿里云 RTC 上课**；课次 **全程音视频录制** 落 OSS；专家标记课次完成 → 班主任确认 → **双确认后课次入账**；关键路径有自动化测试。

### 1.3 成功指标

| 指标 | 目标 |
|------|------|
| 课次闭环 | AC-P2-01 集成测试绿 |
| RTC 入会 | 课次可获取 join-token 并进教室页（staging 真 RTC） |
| 云录制 | 课次结束可查询 OSS 录制资产（AC-P2-05） |
| 课次入账 | 运营确认课次完成后写入 `income_lines`（AC-P2-06） |
| 学员课表 | 学生端课表接 API |
| Phase 1 回归 | `phase1-delivery-chain` 仍可运行 |

### 1.4 非目标（Phase 2）

- 公司员工独立后台、专家改派、课次延期工单  
- 专家成本/结算状态、公司 BI 大屏  
- 全渠道通知（P1 占位）

---

## 2. 用户与角色

延续 Phase 1，见 [role-mapping](./design/20251019-role-mapping.md)。

| 角色 | Phase 2 新增能力 |
|------|------------------|
| ops（班主任） | 选专家 slot 排课、发起 RTC 频道、确认课次完成（触发入账）；批量导入学生 |
| expert | 查看课次、进 RTC 教室、标记课次完成 |
| student | 课表、进 RTC 教室、查看录制（授权内） |
| admin | 无新增（专家审核回归） |

---

## 3. 核心域：课次（Course Session）

**实体**: `project_appointments`（产品称「课程」）

### 3.1 字段（Phase 2 增量）

| 字段 | 类型 | 说明 |
|------|------|------|
| `meeting_url` | VARCHAR(512) | **降级/备用**；主路径为平台 RTC join |
| `rtc_session_id` / 关联 | FK | 见 `rtc_sessions.appointment_id` |
| `expert_completed_at` | DATETIME | 专家标记完成时间 |
| `ops_confirmed_at` | DATETIME | 班主任确认完成时间（**触发课次入账**） |

### 3.2 状态机（展示态）

```
scheduled →（可选）confirmed → expert_completed → ops_confirmed
         ↘ cancelled
```

- **scheduled**: 班主任创建课次（含 start/end/topic）
- **confirmed**: RTC 频道已 prepare（或 slot 排课成功）
- **expert_completed**: `expert_completed_at` 非空，待班主任确认
- **ops_confirmed**: `ops_confirmed_at` 非空，`status = completed`

### 3.3 权限

| 动作 | ops | expert | student |
|------|-----|--------|---------|
| 创建课次 | ✅ 负责项目 | ❌ | ❌ |
| prepare RTC / join-token | ✅ | ✅ | ✅ |
| 查看课次 | ✅ | ✅ 所属项目 | ✅ 所属项目 |
| 专家标记完成 | ❌ | ✅ | ❌ |
| 班主任确认完成 | ✅ | ❌ | ❌ |

---

## 4. 功能需求摘要

### FEAT-P2-001 学生批量导入

- FR: `POST /ops/students/import`，body `{ items: [{ realName, phone, school?, major?, targetRole? }] }`
- 单行失败不阻断批次，返回 `{ created, failed: [{ phone, reason }] }`

### FEAT-P2-002 ~ 006 课次管理（班主任）

- 创建：`POST /ops/projects/:id/appointments`
- 更新链接：`PATCH /ops/appointments/:id` `{ meetingUrl }`
- 确认完成：`POST /ops/appointments/:id/confirm-completion`
- UI：`ScheduleManagement` 增加「新建课次」表单

### FEAT-P2-007 ~ 008 专家课次

- 列表：已有 `GET /experts/me/appointments`，增加 `meetingUrl`、完成按钮
- 完成：`POST /projects/:projectId/appointments/:id/expert-complete`

### FEAT-P2-009 学员我的课程

- `GET /student/appointments` 返回当前学员所有课次
- `Schedule.tsx` 接 API；支持「加入会议」外链

### FEAT-P2-010 项目收入汇总（P1）

- `GET /ops/finance/summary`：`{ totalAmount, byStatus: { in_progress, completed, ... } }`

### FEAT-P2-011 通知占位（P1）

- 创建/确认课次时写 `console`/表外日志（后续接短信）

### FEAT-P2-RTC 运营选 slot + 阿里云 RTC + 云录制 OSS

- 设计详述：[20251019-rtc-slot-recording.md](./design/20251019-rtc-slot-recording.md)
- 运营从 `expert_availability_slots` 选课次时段
- 创建课次时绑定 `rtc_sessions`，学员/专家 **平台内入会**
- 云端录制完成后写入 OSS + `rtc_recordings` / `project_files`

### FEAT-P2-INC 课次双确认入账

- 专家 `expert-complete` 后，运营 `confirm-completion` 时：
  - 写入 `income_lines`（带 `appointment_id`，金额规则见 Q-P2-06）
  - 若项目全部课次已确认，可同步推进 `project_nodes` / 项目状态（与 Phase 1 项目完成并存或逐步替代 — 实现期以 sprint-contract 为准）

---

## 5. API 清单（P0）

| Method | Path | 角色 |
|--------|------|------|
| POST | `/ops/students/import` | ops |
| POST | `/ops/projects/:id/appointments` | ops |
| PATCH | `/ops/appointments/:id` | ops |
| POST | `/ops/appointments/:id/confirm-completion` | ops |
| GET | `/student/appointments` | student |
| POST | `/projects/:id/appointments/:apptId/expert-complete` | expert |
| GET | `/ops/finance/summary` | ops |

---

## 6. 验收标准

- **AC-P2-01**: 集成测试 `course-flow.test.ts` — 排课 → 专家完成 → 班主任确认 → 学员可见 completed
- **AC-P2-02**: 学员 `Schedule` 无硬编码 sessions 数组
- **AC-P2-03**: 批量导入至少 2 条学生，重复手机号进入 failed
- **AC-P2-04**: Phase 1 E2E 脚本仍可执行（手工或 CI）
- **AC-P2-05**: 课次结束后可查到至少 1 条录制元数据（OSS key）
- **AC-P2-06**: 运营确认课次完成后专家账本增加对应 `income_lines`（集成测试）

---

## 7. 测试策略

| 层级 | 位置 |
|------|------|
| 集成 | `backend/tests/integration/course-flow.test.ts` |
| E2E | `frontend/e2e/phase2-course-chain.spec.ts` |
| 报告 | `test/phase2/`（对齐 phase1 结构） |

---

## 8. 里程碑（EP-002）

1. 规格与矩阵入库  
2. DB migration + 后端 API  
3. 前端三端接线  
4. 自动化 + SUMMARY  

---

## 9. PO 决策（已关闭）

见 **[20251019-po-decisions-log.md](./design/20251019-po-decisions-log.md)**。

**Q-P2-06**：已选 **方案 A**（总价 ÷ 课次数，最后一课次补余数）。

---

## 10. 参考

- [Phase 1 PRD](../phase-1/PRD-20250914-phase1-master.md)
- [功能矩阵现状](./20251019-feature-matrix-status.md)
- [Phase 3 Backlog](./BACKLOG-phase3-deferred.md)
- [RTC + 录制设计](./design/20251019-rtc-slot-recording.md)
- [PO 决策](./design/20251019-po-decisions-log.md)
