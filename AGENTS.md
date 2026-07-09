# AGENTS.md — Harness 导航目录

> 约 100 行的 Agent 入口索引。详细规则与上下文请按需加载 `docs/` 与 `knowledge/`，禁止在此堆砌百科全书式内容。

## 项目概览

- **目标**：AI-native 软件工程 Harness — 控制平面 + PEV 闭环（Plan → Execute → Verify）
- **技术栈**：Frontend React (Vite) · Backend Fastify · DB Sequelize/MySQL
- **模式**：Creator-Verifier 分离；Orchestrator 不信子 Agent 自报

## 快速导航

| 需要什么 | 去哪里 |
|---------|--------|
| 架构与 ADR | `docs/design-docs/` |
| 产品 PRD / 规格 | `docs/product-specs/prds/` |
| 执行计划 ExecPlan | `docs/exec-plans/active/` |
| Kanban 工单 | `docs/kanban/` |
| 安全规则 | `docs/SECURITY.md` + `knowledge/security_rules.json` |
| 质量门禁 | `docs/QUALITY.md` |
| 历史错误 / 规则 | `knowledge/` |
| Harness 核心代码 | `core/` |
| 前端应用 | `frontend/` |
| 后端应用 | `backend/` |
| Agent Skills | `skills/engineering/` |

## Work Unit 生命周期

```
DECOMPOSE → PLAN → IMPLEMENT → VALIDATE → REVIEW → LEARN → COMMIT
```

- 迭代上限：Review/Test 失败最多 **3–5 轮**，之后升级人类
- 每个任务使用 **git worktree** 隔离（见 `scripts/worktree/`）

## Agent 分工

### 编排层
- **Orchestrator** — 任务分解、状态机、Gate 控制
- **Requirement Agent** — Issue → 结构化任务 + 验收标准

### 执行层
- **Frontend Agent** — `frontend/`
- **Backend Agent** — `backend/`
- **DB Agent** — migrations / schema

### 验证层（独立上下文，不信自报）
- Unit/Integration Test Agent
- Browser Test Agent（Playwright）
- API Test Agent
- DB Verification Agent

### 审查层（对抗性）
- Code Review · Security Review · Architecture Review

### 学习层
- **Knowledge Curator** — Finding → `knowledge/*.json`
- **Doc Gardening** — 文档与代码漂移检测

## 权限模型

| Agent 类型 | 写代码 | 读仓库 | 跑测试 |
|-----------|--------|--------|--------|
| Orchestrator | ✗ | ✓ | ✓（独立验证） |
| Developer | ✓（仅自己 worktree） | ✓ | ✓ |
| Review / Research | ✗ | ✓ | ✓ |

## 任务前必读（Pre-Flight）

1. 加载本任务相关 PRD：`docs/product-specs/`
2. 加载活跃 ExecPlan：`docs/exec-plans/active/`
3. 检索 `knowledge/` 中同类错误的 rules
4. 确认文件范围与 DoD（Definition of Done）

## Skills 工作流

| 阶段 | Skill | 路径 |
|------|-------|------|
| 设计澄清 | grill-me | `skills/engineering/grill-me/` |
| 写 PRD | write-a-prd | `skills/engineering/write-a-prd/` |
| 架构重构 | improve-codebase-architecture | `skills/engineering/improve-codebase-architecture/` |
| 拆工单 | kanban 生成 | `docs/kanban/` |

## 结构化 Finding 格式

Review/Test 失败必须写入 `knowledge/`，格式见 `knowledge/README.md`。

## 禁止事项

- 不要 dump 全仓库进 context
- 不要信 Agent 自报「测试通过」— Orchestrator 必须独立跑
- 不要把决策只留在聊天 / Slack — 一切 check-in 到 `docs/`
