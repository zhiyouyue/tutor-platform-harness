# 安全规则 — Agent 必读

> 所有 Coding / Review / Security Agent 在写代码或审查前必须加载本文件 + `knowledge/security_rules.json`。

## 认证与授权

- 所有 API 路由默认需鉴权，公开路由须显式标注并记录 ADR
- 禁止在日志、错误响应、前端状态中暴露 token、密码、PII
- Session / JWT 密钥仅来自环境变量，禁止硬编码

## 输入验证

- 每个 API 必须定义 JSON Schema（请求 + 响应）
- 禁止将 `req.body` / `req.query` 直接传入 ORM `create` / `update`
- 所有用户输入在 service 层二次校验

## 数据库

- 使用参数化查询；禁止字符串拼接 SQL
- Migration 须经人类审批（高风险 Gate）
- 禁止在生产 migration 中直接删除列（须分阶段 deprecate）

## 依赖与密钥

- 禁止提交 `.env`、API key、私钥
- 新增依赖须经 `npm audit` 通过
- CI 运行 secret scan（见 `.github/workflows/ci.yml`）

## Agent 权限

- Security Agent：**只读**，可 block merge
- Coding Agent：**禁止**修改 `deployment/`、`security/` 配置
- DB Agent：**仅**可写 `backend/migrations/`、`backend/src/models/`

## 违规处理

Review 发现安全问题 → 写入 `knowledge/mistakes/` → Knowledge Curator 升级为 `knowledge/security_rules.json` → CI linter 拦截
