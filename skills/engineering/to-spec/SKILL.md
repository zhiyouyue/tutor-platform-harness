---
name: to-spec
description: Synthesize current conversation into a Harness feature spec (requirements.md + design sections). Use at PLAN after grill-me, when moving from chat to docs/product-specs/features/<id>/.
disable-model-invocation: true
---

# To Spec — 对话 → Feature 四件套草稿

**不要重新 interview** — 综合已有对话与代码库理解，产出 spec 文档。

## Harness 输出路径

```
docs/product-specs/features/<feature-id>/
├── requirements.md   ← 本 skill 主输出
├── design.md         ← 技术决策摘要
├── tasks.md          ← 原子任务（可另跑 planner）
└── tests.md          ← 测试场景（Test Agent 可 refine）
```

## 流程

1. **Explore** — 读 backend/frontend 现状、相关 ADR、`CONTEXT.md`（若有）
2. **Seams** — 列出测试接缝（route / service / component），与用户确认
3. **写 requirements.md**，结构如下
4. **写 design.md 摘要** — 模块、API 契约、schema 变更、Migration 需否
5. **不写生产代码**

## requirements.md 模板

```markdown
# F00X: <Title>

## Problem Statement
用户面临的问题（用户视角）

## Solution
解决方案（用户视角）

## Acceptance Criteria
- [ ] AC1: ...
- [ ] AC2: ...

## User Stories
1. As a ..., I want ..., so that ...

## Out of Scope
- ...

## Implementation Notes（给 Architect）
- Backend: routes/services/schemas 变更
- Frontend: components/hooks 变更
- DB: migration Y/N → 若 Y 标记 Human Approval

## Testing Seams
| Seam | Layer | Tool |
|------|-------|------|
| ... | route | inject |

## ADR References
- ADR-00X: ...
```

## 词汇

- 用项目 domain 语言（`CONTEXT.md` 或 requirements 中定义的术语）
- API 路径对齐 `/api/v1/...`
- 引用 `rules/architecture-boundaries.mdc` 分层约定

## Gate

Orchestrator `verifySpecExists(featureId)` 检查四件套齐全后才 IMPLEMENT。

## 上游

改编自 [mattpocock/skills to-spec](https://github.com/mattpocock/skills)，输出路径适配 Harness feature 四件套
