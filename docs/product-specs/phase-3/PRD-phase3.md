# Phase 3 PRD — 班主任闭环、课次异常、站内通知、公司看板

| 项 | 内容 |
|----|------|
| 版本 | 1.1（2026-10-29） |
| 状态 | **已实现**（含 FR-P3-09 / FR-P3-10） |
| 范围 | 不含成本/结算（Q-P3-04/05 延期）、不含 company_staff（Q-P3-01-A） |

## 1. 背景与目标

在 Phase 2 课次与 RTC 基础上，按 PO 确认（Q-P3-03～09）交付：项目进行中途改派专家、课次延期/改期/扣费、专家完成备注与完成记录、站内通知、管理员按专家看板；班主任数据隔离与项目详情。

## 2. 用户与角色

| 角色 | 目标 |
|------|------|
| 管理员 admin | 专家认证、**按专家聚合项目看板** |
| 班主任 ops | 负责项目/学生/课次、**改派**、**异常处理**、确认完成 |
| 专家 expert | 课表、进课堂、**带备注标记完成**、收站内通知 |
| 学员 student | 课表、**细化状态**、进课堂、收站内通知 |

## 3. 功能需求（FR）

| ID | 需求 | 验收要点 |
|----|------|----------|
| FR-P3-01 | 班主任仅见 `ops_user_id=本人` 的项目/学生/课次 | RBAC 集成测试 403 |
| FR-P3-02 | `PATCH /ops/projects/:id` 改派专家并通知 | phase3-po-decisions |
| FR-P3-03 | 课次 defer / reschedule / mark-incomplete（含扣费字段） | API + 班主任课程 UI |
| FR-P3-04 | 专家完成 `completionNotes`；`GET .../completion-record` 七字段 | Q-P3-07 |
| FR-P3-05 | 站内通知表 + 列表/已读；排课/改派/改期写通知 | notifications API + 三端铃铛 |
| FR-P3-06 | `GET /admin/dashboard/by-expert` | 与 ops dashboard 按项目区分 |
| FR-P3-07 | 班主任**项目详情页**（课次列表、改派、发布/确认） | OpsProjectDetail |
| FR-P3-08 | 学员课次 **statusLabel**（即将上课/进行中/待确认/已完成等） | student/appointments + UI |

## 4. 非功能

- 分层：routes → services → repositories（BE-001）
- 迁移 `07_phase3_appointments_notifications.sql` 可重复执行
- 后端测试：集成 + 单元；覆盖率门禁见 `backend/vitest.config.ts`（domain/services 子集）

## 5. 不在范围

- 短信/邮件（Q-P3-08 待办阿里云）
- 财务成本、结算单（Q-P3-04/05）
- 独立 company_staff 账号

## 6. 2026-10-29 增补

### FR-P3-09 辅导内容固定为 6 项

四个端（管理员、运营、专家、学员）看到的辅导内容都来自同一字典 `dict_coaching_types`，只展示启用项：

| 顺序 | 编码 | 名称 |
|------|------|------|
| 1 | `career_planning` | 职业规划 |
| 2 | `resume_optimization` | 简历优化 |
| 3 | `mock_interview` | 模拟面试 |
| 4 | `interview_review` | 面试复盘 |
| 5 | `salary_negotiation` | 谈薪 |
| 6 | `offer_selection` | OFFER选择 |

**验收**

| 端 | 看到哪里 |
|----|----------|
| 管理员 | 专家认证资料里的「辅导内容」 |
| 运营 | 创建项目时勾选辅导内容 |
| 专家 | 「我的能力」里的辅导内容 |
| 学员 | 「我的辅导」项目节点名称 |

`Offer 谈判`、`行业洞察`、`项目复盘` 停用，不再出现在选择列表。已经用旧编码创建的项目仍保留原标签。迁移脚本：`backend/sql/08_coaching_types_v2.sql`。

### FR-P3-10 运营可约导师未开放的时间

运营在项目课表上排课、改期时，可以拖到导师每周档期之外的时间。浅色带仍表示导师自己开放的时段，空白处也可排课。

| 可以 | 不可以 |
|------|--------|
| 导师未开放的空白时段 | 已经过去的时间 |
| 导师已开放时段内 | 导师标记的全天不可用 |
| 改期到空白时段 | 与已有课次重叠 |

## 7. 交付物

- 代码：backend + frontend
- 文档：本 PRD、API-PERMISSIONS、TASKS、OPEN-QUESTIONS、DEPLOYMENT-CHECKLIST、**GRADING-RUBRIC**
- 测试：`tests/integration/phase3-*`、`tests/unit/sessionPresentation.test.ts`、`frontend/e2e/phase3-po-features.spec.ts`
