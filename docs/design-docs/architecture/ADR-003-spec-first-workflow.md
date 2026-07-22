# ADR-003: Specification First, Code Second

- **状态**: 已接受
- **日期**: 2026-07-22
- **决策者**: Human Architect

## 背景

Agent 擅长实现但弱于模糊意图。无规格的生产代码会导致架构漂移与返工。

## 决策

**禁止**无 written specification 的生产代码。每个 feature 必须产出：

```
docs/product-specs/features/<feature-id>/
├── requirements.md   # 需求与验收标准
├── design.md         # 技术设计
├── tasks.md          # 原子任务拆分
├── tests.md          # 测试计划（Test Agent 先写）
└── sprint-contract.md # 当前 sprint 双边契约（CONTRACT 阶段，见 ADR-004）
```

长 feature / 多 session 另需：

```
docs/product-specs/features/<feature-id>/handoff.json  # context reset 状态（ADR-004）
```

工作流：

```
Requirement → Architecture → Technical Design → Implementation Plan
  → Sprint Contract → Code → Tests → Review
```

## 理由

- 规格是 Agent 间的契约
- Test Agent 可依 tests.md 先写测试（TDD）
- Review Agent 可依 requirements.md 验收

## Agent 指令

- Requirement Agent：产出 requirements.md，不写代码
- Architect Agent：产出 design.md + 必要时新 ADR
- Planner Agent：产出 tasks.md，每任务 < 500 行、< 1 天
- Coding Agent：**无四件套不得开工**；**无 APPROVED sprint-contract 不得 IMPLEMENT**（ADR-004）
- Test Agent：CONTRACT 阶段批准 sprint-contract 中的 SC-* 可测性
