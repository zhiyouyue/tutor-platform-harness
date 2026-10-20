# Phase 2 实施任务清单（已关闭）

> **Phase 2 状态：已关闭（2026-10-20）**  
> 原「下一阶段做」项已在 [Phase 3](../phase-3/PRD-phase3.md) 落地或 PO 标为不做；**现行矩阵**见 [phase-3/20251019-feature-matrix.md](../phase-3/20251019-feature-matrix.md)。

## Phase 2 本阶段任务

| ID | 任务 | 状态 | 证据 / 说明 |
|----|------|------|-------------|
| T-P2-DOC-01 | PRD + 矩阵 + backlog | ✅ | `PRD-20251019-phase2-master.md` |
| T-P2-DB-01 | meeting_url / 完成时间戳 | ✅ | SQL 04/05 |
| T-P2-BE-01 | 课次 CRUD 闭环 API | ✅ | `course-flow.test.ts` |
| T-P2-BE-02 | 学生 import | ✅ | ops import API |
| T-P2-BE-03 | ops finance summary | ✅ | `GET /ops/finance/summary` |
| T-P2-FE-01 | 班主任课程管理 UI | ✅ | `ScheduleManagement.tsx` |
| T-P2-FE-02 | 专家/学员课表接线 | ✅ | expert/student Schedule |
| T-P2-TEST-01 | course-flow 集成测试 | ✅ | `course-flow.test.ts` |
| T-P2-TEST-02 | phase2 Playwright 冒烟 | ✅ | `frontend/e2e/phase2-course-chain.spec.ts`，截图 `test/phase2/screenshots/` |
| T-P2-FE-03 | 学员 Dashboard 去 mock | ✅ | `StudentDashboard.tsx` → `fetchStudentProjects` / `fetchStudentAppointments` |
| T-P2-FE-04 | 公司后台财务页（P1） | ✅ | `OpsFinance.tsx` + finance summary API |
| T-P2-BE-04 | 通知占位表/队列 | ✅ | **Phase 3 升格**：`user_notifications` + `T-P3-NOTIF-01`（非占位队列） |
| T-P2-REG-01 | Phase 1 E2E 回归 | ⏭ | 例行：`npm run test:e2e -w frontend -- phase1-delivery-chain`（发布前人工/CI，非 Phase 2 阻塞） |
| T-P2-RTC-01 | 运营从 expert slot 排课 + blackout | ✅ | `rtc-phase21.test.ts` |
| T-P2-RTC-02 | 课次 prepare RTC + join-classroom | ✅ | `appointmentClassroomService` |
| T-P2-RTC-03 | 前端 MeetingRoom（dingrtc SDK） | ✅ | `MeetingRoom.tsx` |
| T-P2-RTC-04 | 云端录制回调 → OSS + 元数据表 | ✅ | `06_phase2_rtc_recordings.sql` |
| T-P2-INC-01 | 运营确认课次 → income_lines | ✅ | `sessionIncomeService.test.ts` |

## 自 Phase 2 backlog 迁入 Phase 3 的对应关系

| 原 backlog 主题 | Phase 3 任务 / FR | 状态 |
|-----------------|-------------------|------|
| 班主任按项目过滤 | T-P3-OPS-01 | ✅ |
| 项目详情 / 改派专家 | T-P3-OPS-03、T-P3-PRJ-01 | ✅ |
| 课次异常延期/未完成 | T-P3-EXC-01 | ✅ |
| 课次完成记录 | T-P3-EXP-02 | ✅ |
| 学员课程状态 | T-P3-STU-02 | ✅ |
| 站内通知 | T-P3-NOTIF-01 | ✅ |
| 公司级项目看板（按专家） | T-P3-BI-01 | ✅ |
| 公司员工独立登录 | T-P3-COMP-01 | ⛔ Q-P3-01 |
| 成本/结算 | T-P3-FIN-01 | ⛔ Q-P3-04/05 |

验收索引：[GRADING-RUBRIC.md](../phase-3/GRADING-RUBRIC.md)
