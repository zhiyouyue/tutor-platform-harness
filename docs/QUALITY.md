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
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
  Build     Tests    Security    Review
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

- Review / Test 失败：**最多 3–5 轮**，之后升级人类
- 连续 3 次同类错误 → Knowledge Curator 写入 `knowledge/mistakes/`

## 模块质量评分（人工维护）

| 模块 | 测试覆盖 | 文档 | 上次 Review | 备注 |
|------|---------|------|------------|------|
| backend | 低（health only） | README | — | Phase 0 |
| frontend | 低 | README | — | Phase 0 |
| core | 骨架 | — | — | Phase 0 |
