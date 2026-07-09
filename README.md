# AI-native Software Engineering Harness

控制平面 + PEV 闭环，用于大型软件项目的 Agent 协作开发。

## 目录结构

```
.
├── AGENTS.md              # Agent 导航目录（~100 行）
├── docs/                  # 全部文档
├── frontend/              # React (Vite) 前端应用
├── backend/               # Fastify 后端应用
├── core/                  # Harness 控制平面（编排、Agent 循环、Eval）
├── knowledge/             # 结构化规则与历史错误
├── skills/                # Agent Skills（含 mattpocock engineering）
├── rules/                 # CI linter / 结构测试规则
├── scripts/               # 自动化脚本（worktree、CI、kanban）
└── .cursor/               # Cursor IDE 规则与 Hooks
```

## 设计文档

- [架构设计总结](docs/design-docs/harness-design-summary.md)
- [初始构想](docs/design-docs/idea.md)
- [Agent 与 Skills 想法](docs/design-docs/agentsideas.md)

## 快速开始

```bash
# 安装依赖
npm install

# 启动后端 + 前端（分别开终端更稳妥）
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5173

# 运行测试
npm test

# Harness 演示
npm run agent
npm run eval
```

## 核心原则

> **规范（rules）→ 执行（agents）→ 审查（reviewers）→ 学习（memory）→ 机械升级（CI）**
