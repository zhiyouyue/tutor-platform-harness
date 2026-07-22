# AGENTS.md — Harness 导航目录

> 约 100 行的 Agent 入口索引。详细规则按需加载 `docs/` 与 `knowledge/`。
>
> **核心原则**：把 Agent 当作分布式工程团队，而非「打字更快的初级开发」。

## 项目概览

- **目标**：AI-native 软件工程 Harness — 控制平面 + PEV 闭环
- **技术栈**：React (Vite) · Fastify · Sequelize/MySQL
- **模式**：Creator-Verifier 分离；Orchestrator 不信子 Agent 自报

## 快速导航

| 需要什么 | 去哪里 |
|---------|--------|
| 架构与 ADR | `docs/design-docs/architecture/` |
| Feature 规格（四件套 + contract） | `docs/product-specs/features/<id>/` |
| 规格 / handoff 模板 | `docs/templates/feature/` · `docs/templates/handoff.json` |
| ExecPlan | `docs/exec-plans/active/` |
| Kanban | `docs/kanban/` |
| 安全规则 | `docs/SECURITY.md` + `knowledge/security_rules.json` |
| 质量门禁 | `docs/QUALITY.md` |
| 工程记忆 | `knowledge/mistakes/` + `knowledge/patterns/` |
| Agent 权限 | `rules/agent-permissions.json` |
| 持久约束 Rules | `rules/*.mdc`（见 `rules/README.md`） |
| Harness 核心 | `core/` |
| Skills | `skills/engineering/`（见 `skills/engineering/README.md`） |

## 15 条工程铁律（摘要）

| # | 规则 | 落地 |
|---|------|------|
| 1 | Specification First | ADR-003 + feature 四件套 |
| 2 | 单一职责 Agent | `core/src/agents/roles.ts` |
| 3 | 每变更必 Review | VALIDATE → REVIEW Gate |
| 4 | 测试是 Source of Truth | tests.md 先于代码 |
| 5 | main 永远绿 | CI + Orchestrator Gate |
| 6 | ADR 记录架构决策 | `docs/design-docs/architecture/` |
| 7 | AGENTS.md 宪法 | 本文件 |
| 8 | 从错误中学习 | `knowledge/` |
| 9 | 自动化 Quality Gate | `.github/workflows/ci.yml` |
| 10 | Browser Test 分层 | P002 pattern |
| 11 | 权限边界 | `rules/agent-permissions.json` |
| 12 | 小步变更 | < 500 行 / PR |
| 13 | 高风险 Human Approval | migration / 安全 / 部署 |
| 14 | Agent OS | Orchestrator + PEV 状态机 |
| 15 | 度量 Agent | `npm run eval`（stub） |

## Work Unit 生命周期

```
DECOMPOSE → PLAN → CONTRACT → IMPLEMENT → VALIDATE → REVIEW → LEARN → COMMIT
```

- **CONTRACT**：Coding Agent 起草 `sprint-contract.md` → Test Agent 批准 `Status: APPROVED` 后才可 IMPLEMENT（ADR-004）
- **Context reset**：长 session 写 `handoff.json`，新 session 只加载 `resumeBundle`（模板 `docs/templates/handoff.json`）
- 迭代上限：Review/Test/Contract 失败最多 **3–5 轮** → 升级人类
- 每任务 **git worktree** 隔离（`scripts/worktree/`）

## Agent 分工（禁止 Super Agent）

```
Orchestrator
    ├── Requirement Agent → requirements.md
    ├── Architect Agent   → design.md + ADR
    ├── Planner Agent     → tasks.md
    ├── Coding Agents     → Backend / Frontend / DB
    ├── Test Agents       → 先写测试，独立验证
    ├── Review Agents     → Code / Security / Architecture
    └── Knowledge Curator → knowledge/
```

| 层级 | 角色 | 写代码 | 独立验证 |
|------|------|--------|---------|
| 编排 | Orchestrator | ✗ | ✓ 跑 test/build |
| 执行 | Developer | ✓ worktree 内 | ✗ |
| 验证 | Test / Browser | 仅 tests/ | ✓ |
| 审查 | Review / Security | ✗ | ✓ |
| 学习 | Knowledge Curator | knowledge/ | ✗ |

## 编码宪法

### Backend

- 分层：routes → services → models
- 每 API 须 JSON Schema
- 禁止 route 直访 DB（见 BE-001）

### Frontend

- 组件 < 200 行
- 业务逻辑不在 UI（hooks/services）
- API 类型对齐 backend schema

### Database

- Migration 可逆、须 Human Approval
- 禁止直接删列

## Pre-Flight（任务前必读）

1. 加载 feature 四件套：`docs/product-specs/features/<id>/`
2. 读相关 ADR：`docs/design-docs/architecture/`
3. 检索 `knowledge/` 同类错误
4. 确认权限：`rules/agent-permissions.json`
5. 确认 DoD 与文件范围

## Rules + Skills 三层

```
AGENTS.md（本文件，宪法）
    ├── rules/*.mdc      — 持久约束，按需加载（`rules/rule-index.mdc` 路由）
    └── skills/engineering/*/SKILL.md — PEV 工作流
```

## Skills 工作流（PEV 映射）

| 阶段 | Skill | 路径 |
|------|-------|------|
| DECOMPOSE / 设计澄清 | grill-me | `skills/engineering/grill-me/` |
| PLAN / 写规格 | to-spec | `skills/engineering/to-spec/` |
| CONTRACT / 双边契约 | sprint-contract 模板 | `docs/templates/feature/sprint-contract.md` |
| PLAN / 领域语言 | domain-modeling | `skills/engineering/domain-modeling/` |
| IMPLEMENT | tdd | `skills/engineering/tdd/` |
| IMPLEMENT / 架构决策 | clean-architecture | `skills/engineering/clean-architecture/` |
| REVIEW / 持续改进 | improve-codebase-architecture | `skills/engineering/improve-codebase-architecture/` |
| REVIEW | architecture-guard | `skills/engineering/architecture-guard/` |
| 设计词汇 | codebase-design | `skills/engineering/codebase-design/` |
| 拆工单 | kanban | `docs/kanban/` |

## Rules 速查

| 场景 | Rule |
|------|------|
| Backend 分层 / BE-001 | `rules/architecture-boundaries.mdc` |
| Fastify route 模式 | `rules/fastify-layer-discipline.mdc` |
| API + JSON Schema | `rules/api-design.mdc` |
| React 前端 | `rules/react-vite-frontend.mdc` |
| 测试 / TDD | `rules/testing-tdd.mdc` |
| 防过度工程 | `rules/anti-overengineering.mdc` |
| 防 LLM 反模式 | `rules/llm-anti-patterns.mdc` |
| PR 架构审查 | `rules/pr-review-architecture.mdc` |

## 禁止事项

- 无 `requirements.md` 不写生产代码
- 无 `Status: APPROVED` 的 `sprint-contract.md` 不进入 IMPLEMENT
- context reset 后只读 `handoff.json` 的 `resumeBundle`，不 replay 完整聊天
- 不要 dump 全仓库进 context
- 不要信 Agent 自报「测试通过」
- 不要把决策只留在聊天 — 一切 check-in 到 `docs/`
