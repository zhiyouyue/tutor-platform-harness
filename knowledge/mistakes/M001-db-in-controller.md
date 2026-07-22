# M001: Controller 内直接访问数据库

- **Rule ID**: BE-001
- **Severity**: HIGH
- **Category**: Architecture
- **Times Detected**: 0（模板示例）

## Problem

Agent 在 route handler 中直接调用 `User.findAll()` 或编写 raw SQL。

## Why Wrong

违反分层架构（ADR-001）。Route 层应只负责 HTTP 契约；业务逻辑在 service；数据访问在 model/repository。

## Correct Approach

```
routes/user.ts     → 解析请求、调用 service、返回响应
services/user.ts   → 业务逻辑、校验
models/user.ts     → Sequelize 模型
```

## Future Rule

> Never access DB outside service layer. Routes must not import models directly.

## Enforcement Path

1. Review Agent 标记 → 写入本文件
2. 重复 3 次 → `rules/structure-tests/no-db-in-routes.js`
3. CI block merge
