# AI-native Software Engineering Harness

控制平面 + PEV 闭环，用于大型软件项目的 Agent 协作开发。

> **Treat AI agents as a distributed engineering team** — processes, constraints, memory, reviews, and tests.

## 目录结构

```
.
├── AGENTS.md                 # Agent 宪法（导航索引）
├── docs/
│   ├── design-docs/          # 架构、ADR
│   ├── product-specs/        # Feature 四件套
│   ├── exec-plans/           # 执行计划
│   ├── templates/feature/    # requirements/design/tasks/tests 模板
│   ├── SECURITY.md
│   └── QUALITY.md
├── knowledge/
│   ├── mistakes/             # 结构化 Finding
│   ├── patterns/             # 已批准模式
│   └── *.json                # 机器可读规则索引
├── core/                     # Orchestrator + Gate + Agent 角色
├── rules/
│   ├── agent-permissions.json
│   └── structure-tests/
├── scripts/worktree/         # 任务隔离
├── skills/engineering/       # mattpocock skills
├── frontend/                 # React 应用
├── backend/                  # Fastify 应用
└── .github/workflows/        # CI Quality Gates
```

## 设计文档

- [架构设计总结](docs/design-docs/harness-design-summary.md)
- [初始构想](docs/design-docs/idea.md)
- [Agent 与 Skills 想法](docs/design-docs/agentsideas.md)
- [ADR 索引](docs/design-docs/architecture/)

## 快速开始

```bash
npm install

# 开发
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5173

# 测试 + 门禁
npm test
npm run agent              # Orchestrator 独立跑 Gate
npm run agent -- --dry-run # 只看工作流说明

# Worktree 隔离
node scripts/worktree/create.mjs TICKET-001
```

## Feature 工作流

```
Requirement → Design → Tasks → Tests → Code → Review → Merge
```

每个 feature 在 `docs/product-specs/features/<id>/` 创建四件套（复制 `docs/templates/feature/`）。

## 核心原则

> **规范 → 执行 → 审查 → 学习 → 机械升级（CI）**

每一次失败都让系统更难再犯同样的错。
