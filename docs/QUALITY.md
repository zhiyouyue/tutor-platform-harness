# 质量门禁 — Quality Gates

> Orchestrator 在每个 Work Unit 的 COMMIT 阶段独立验证，不信 Agent 自报。

## Gate 流程

```
Commit / PR
    │
    ▼
┌─────────────────┐
│   Quality Gate  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬─────────────┐
    ▼         ▼          ▼          ▼             ▼
  Build     Tests    Security    Review    Sprint Contract
```

## 必须通过（Blocking）

| Gate | 命令 / 检查 | 负责 Agent |
|------|------------|-----------|
| Build | `npm run build` | Orchestrator 独立跑 |
| Unit/Integration | `npm test` | Test Agent |
| Lint | `npm run lint`（各 workspace） | CI |
| Type check | `tsc --noEmit` | CI |
| Review | Review Agent APPROVED | Review Agent |
| Spec 存在 | feature 四件套齐全 | Orchestrator |
| Sprint Contract | `sprint-contract.md` 含 `Status: APPROVED` | Test Agent + Orchestrator `verifySprintContractApproved()` |
| Handoff（reset 后续跑） | `handoff.json` 可解析 | Orchestrator `verifyHandoffArtifact()` |

## 推荐通过（Warning → 逐步 Blocking）

| Gate | 说明 |
|------|------|
| E2E | Playwright Browser Test Agent |
| Coverage | 新代码覆盖率 ≥ 80% |
| Complexity | 单函数圈复杂度 ≤ 15 |
| Duplicate | 重复代码检测 |
| Docs 新鲜度 | PRD/ADR 与代码不漂移 |

## 变更规模限制

- 单次 PR **< 500 行**有效变更（generated 除外）
- 单次 PR **单一职责**
- 超规模须拆分为多个 Work Unit

## 迭代上限

- Review / Test / **Contract** 失败：**最多 3–5 轮**，之后升级人类
- Contract 协商默认 **3 轮**（`HARNESS_MAX_CONTRACT_ROUNDS`），超限回 PLAN
- 连续 3 次同类错误 → Knowledge Curator 写入 `knowledge/mistakes/`

## Context Reset（长 feature / 多 session）

| 项 | 说明 |
|----|------|
| Handoff 路径 | `docs/product-specs/features/<id>/handoff.json` |
| 模板 | `docs/templates/handoff.json` |
| 默认 token 上限 | 150k（`HARNESS_MAX_TOKENS`） |
| 默认 step 上限 | 80（`HARNESS_MAX_STEPS`） |
| 续跑加载 | 仅 `resumeBundle`，禁止 replay 完整聊天 |

详见 [ADR-004](./design-docs/architecture/ADR-004-sprint-contract-and-context-reset.md)。

## 模块质量评分（人工维护）

| 模块 | 测试覆盖 | 文档 | 上次 Review | 备注 |
|------|---------|------|------------|------|
| backend | 低（health only） | README | — | Phase 0 |
| frontend | 低 | README | — | Phase 0 |
| core | 骨架 | — | — | Phase 0 |
