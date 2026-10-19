# Phase 2 — 导师平台（课程交付闭环）

- **阶段代号**: Phase 2
- **Feature 前缀**: `FEAT-P2-*`
- **关联 ExecPlan**: [EP-002-tutor-platform-phase2](../../exec-plans/active/EP-002-tutor-platform-phase2.md)
- **上一阶段**: [Phase 1 PRD](../phase-1/PRD-20250914-phase1-master.md)（专家交付 + 运营派单 + 管理员审核，E2E 12/12 通过）

## 文档索引

| 文档 | 说明 |
|------|------|
| [PRD-20251019-phase2-master.md](./PRD-20251019-phase2-master.md) | 第二阶段主 PRD |
| [20251019-feature-matrix-status.md](./20251019-feature-matrix-status.md) | PO 功能矩阵 ↔ 代码/测试现状 |
| [BACKLOG-phase3-deferred.md](./BACKLOG-phase3-deferred.md) | 「下一阶段做」 backlog |
| [design/20251019-role-mapping.md](./design/20251019-role-mapping.md) | 产品角色 ↔ 系统角色映射 |
| [design/20251019-po-decisions-log.md](./design/20251019-po-decisions-log.md) | PO 已确认决策 |
| [design/20251019-rtc-slot-recording.md](./design/20251019-rtc-slot-recording.md) | RTC 选档 / 入会 / 录制 OSS |

## Phase 2 目标（一句话）

在 Phase 1 项目交付能力之上，把 **「课程（预约）」** 作为可运营、可上课、可双确认完成的一等公民，并补齐学员端真实数据与自动化回归。

## Harness 约定

- 每个 P0 Feature 需：`requirements.md` + `tests.md` + `sprint-contract.md`（APPROVED 后 IMPLEMENT）
- 自动化：`backend/tests/integration/*` + `frontend/e2e/phase2-*` + 报告目录 `test/phase2/`
