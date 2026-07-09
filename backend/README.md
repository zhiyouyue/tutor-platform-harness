# Backend — Fastify + Sequelize 应用

由 **Backend Agent** 与 **DB Agent** 维护。

## 目录结构

```
backend/
├── src/
│   ├── plugins/            # Fastify 插件（鉴权、DB、CORS 等）
│   ├── routes/             # 路由 + JSON Schema 定义
│   ├── schemas/            # 共享 JSON Schema（可生成 OpenAPI）
│   ├── services/           # 业务逻辑
│   ├── models/             # Sequelize 模型
│   ├── hooks/              # 生命周期 hooks
│   ├── app.ts              # Fastify 实例组装
│   └── server.ts           # 启动入口
├── migrations/             # DB Agent 管理
├── seeders/
├── tests/
│   ├── unit/
│   └── integration/        # API Test Agent
├── package.json
└── tsconfig.json
```

## Agent 约束

- 仅修改自己 worktree 下的 `backend/`
- 每个路由必须定义 **JSON Schema**（请求 + 响应）
- Schema 变更必须附带 `migrations/`
- 任务前加载 `knowledge/backend_mistakes.json` + `knowledge/security_rules.json`
- 禁止将 `req.body` 直接传入 ORM create

## 开发

```bash
cd backend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run test
```

## OpenAPI

Schema 可导出至 `docs/generated/openapi.json`（待 CI 脚本接入）。
