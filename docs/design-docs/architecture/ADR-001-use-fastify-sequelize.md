# ADR-001: 使用 Fastify + Sequelize + MySQL

- **状态**: 已接受
- **日期**: 2026-07-08
- **决策者**: Human Architect

## 背景

Harness 需要可验证的后端栈，支持 JSON Schema 驱动的 API 契约与 ORM 迁移。

## 决策

- HTTP 框架：**Fastify 5**（内置 JSON Schema 验证）
- ORM：**Sequelize** + MySQL
- 前端：**React + Vite**

## 理由

- Fastify schema 可生成 OpenAPI，利于 API Test Agent
- Sequelize migrations 由 DB Agent 专责，符合权限边界
- 与业界 Agent Harness 常见 Node 栈一致，工具链成熟

## 后果

### 正面

- 路由层强制 schema，减少 Agent 漏验证
- Migration 可审计、可回滚

### 负面

- Sequelize 类型推断弱于 Prisma，需更多手写类型

## Agent 指令

- Backend Agent：业务逻辑在 `services/`，路由在 `routes/`，禁止 controller 直查 DB
- DB Agent：仅修改 `migrations/` 和 `models/`
- 每个新路由必须附带 request + response schema
