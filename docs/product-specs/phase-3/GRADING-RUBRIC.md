# Phase 3 Grading Rubric（检查 → 复测 → 完成）

> 流程：**PRD** → **开发** → **测试** → **本 Rubric 打分** → **未过则修复并复测** → **全部 Pass 即 Phase 3 完成**

## 评分说明

| 等级 | 含义 |
|------|------|
| **Pass** | 有代码 + 有自动化证据 |
| **Fail** | 缺失或测试红 |
| **N/A** | PO 明确不做 |

---

## A. 文档（PRD）

| # | 检查项 | 证据 | 结果 |
|---|--------|------|------|
| A1 | PRD 与 OPEN-QUESTIONS 一致 | `PRD-phase3.md` | ✅ |
| A2 | API 权限矩阵含 Phase3 路由 | `API-PERMISSIONS.md` | ✅ |
| A3 | 部署含 SQL 07 | `DEPLOYMENT-CHECKLIST.md` | ✅ |

## B. 功能（对照 FR-P3）

| # | FR | 检查方法 | 结果 |
|---|-----|----------|------|
| B1 | FR-P3-01 班主任隔离 | `npm run test -w backend -- rbac-ops-scope` | ✅ |
| B2 | FR-P3-02 改派专家 | `phase3-po-decisions.test.ts` Q-P3-03 | ✅ |
| B3 | FR-P3-03 课次异常 | defer/reschedule/mark-incomplete 用例 | ✅ |
| B4 | FR-P3-04 完成记录 | completion-record + notes 用例 | ✅ |
| B5 | FR-P3-05 站内通知 | notifications API + `NotificationBell` 三端 | ✅ |
| B6 | FR-P3-06 管理员看板 | `/admin/dashboard/by-expert` + ExpertProjectBoard | ✅ |
| B7 | FR-P3-07 项目详情 | `OpsProjectDetail` + GET `/ops/projects/:id` | ✅ |
| B8 | FR-P3-08 学员 statusLabel | `phase3-completion.test.ts` + Schedule UI | ✅ |
| B9 | 成本/结算 | — | **N/A** |
| B10 | company_staff | — | **N/A** |

## C. 自动化测试

| # | 命令 | 期望 | 结果 |
|---|------|------|------|
| C1 | `npm run test -w backend` | 全绿（53 tests） | ✅ |
| C2 | `npm run test:coverage -w backend` | 门禁通过（lines 92.7% 子集） | ✅ |
| C3 | `npm run test:e2e -w frontend -- phase3-po-features` | 3 passed（需 dev 服务） | ☐ 本地复跑 |
| C4 | `npm run build -w frontend` | 成功 | ✅ |

## D. 覆盖率（子集）

门禁范围：`src/domain/**`、`src/services/notificationService.ts`、`src/services/projectOpsService.ts`、`src/services/appointmentService.ts`（presentation 部分由 domain 单测覆盖）。

| 指标 | 阈值 |
|------|------|
| lines | ≥ 75% |
| functions | ≥ 70% |
| branches | ≥ 65% |

报告目录：`test/phase3/coverage/`

---

## E. UI / 蓝系设计 + Figma MCP

| # | 检查项 | 证据 | 结果 |
|---|--------|------|------|
| E1 | UI 验收标准文档 | `docs/product-specs/UI-ACCEPTANCE-FIGMA.md` | ✅ |
| E2 | 全站 `--c-*` 蓝系令牌 | `frontend/src/index.css` | ✅ |
| E3 | 四角色页面清单审查 | `test/frontend/UI-VERIFICATION-20261020.md` | ✅ |
| E4 | `npm run build -w frontend` | 生产构建 | ✅ |
| E5 | E2E `ui-blue-theme` | 需 dev 服务 + 截图 `test/frontend/screenshots/ui-blue/` | ☐ 本地复跑 |
| E6 | 重大改版时 Figma MCP | 见 UI-ACCEPTANCE §2（本次为令牌统一，未强制回写 Figma） | N/A |

## 一键验证（PowerShell，仓库根目录）

```powershell
Set-Location backend; npx tsx scripts/run-sql.ts sql/07_phase3_appointments_notifications.sql
npm run test
npm run test:coverage
Set-Location ..\frontend
npm run build
npm run test:e2e -- phase3-po-features
npm run test:e2e -- ui-blue-theme
```

## 完成定义（DoD）

- [x] B1～B8 均为 **Pass**
- [x] C1、C2、C4 **Pass**（C3 E2E 需 dev 环境本地复跑）
- [x] `TASKS-phase3.md` 无 ⬜/🟡（除 N/A）
- [x] `test/phase3/ISSUES.md` 仅历史记录，无阻塞项

**签字**：Agent 跑通 C1/C2 后可将本表结果更新为 Pass 并勾选 DoD。
