# Harness Rules — 持久约束层

> Rules 写「法律」：Agent Requested 或 Globs 触发，不占用 Always Apply 的 token。
> 宪法见根目录 `AGENTS.md`；工作流见 `skills/engineering/`。

## 三层结构

```
AGENTS.md（宪法，Always Apply，~100 行）
    └── rules/*.mdc（本目录，按需加载）
    └── skills/engineering/*/SKILL.md（工作流，按需加载）
```

## 规则索引

| 规则 | 触发方式 | 适用 |
|------|----------|------|
| [rule-index.mdc](./rule-index.mdc) | Agent Requested | 规则路由表 |
| [architecture-boundaries.mdc](./architecture-boundaries.mdc) | Globs: `backend/**` | BE-001 + 分层边界 |
| [fastify-layer-discipline.mdc](./fastify-layer-discipline.mdc) | Globs: `backend/**` | routes → services → models |
| [api-design.mdc](./api-design.mdc) | Globs: `backend/src/routes/**`, `backend/src/schemas/**` | JSON Schema + REST |
| [error-handling.mdc](./error-handling.mdc) | Globs: `backend/src/**` | 生产级错误处理 |
| [react-vite-frontend.mdc](./react-vite-frontend.mdc) | Globs: `frontend/**` | React + Vite 前端约束 |
| [testing-tdd.mdc](./testing-tdd.mdc) | Globs: `**/*.test.ts`, `**/*.spec.ts` | 红-绿-重构 |
| [anti-overengineering.mdc](./anti-overengineering.mdc) | Agent Requested | YAGNI / 小步变更 |
| [llm-anti-patterns.mdc](./llm-anti-patterns.mdc) | Agent Requested | LLM 行为反模式 |
| [pr-review-architecture.mdc](./pr-review-architecture.mdc) | Agent Requested | Review Agent 架构维度 |

## 来源与改编

| 规则 | 上游来源 |
|------|----------|
| architecture-boundaries, api-design, error-handling, testing-tdd | [GoranErhartic/cursor-development-rules](https://github.com/GoranErhartic/cursor-development-rules) |
| anti-overengineering, pr-review-architecture | [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) |
| llm-anti-patterns | [beettlle/CursorRules](https://github.com/beettlle/CursorRules) |
| fastify-layer-discipline, react-vite-frontend | Harness 本地化（Fastify + React/Vite） |

## Cursor IDE

Cursor 从 `.cursor/rules/` 加载规则。本目录为 Harness 规范源；`.cursor/rules/harness-rules-index.mdc` 指向此处。

## 结构测试

`rules/structure-tests/no-db-in-routes.ts` 在 CI 中强制执行 BE-001（routes 禁止直访 models）。
