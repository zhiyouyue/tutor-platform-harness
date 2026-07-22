# P001: 后端分层 Service 模式

- **Pattern ID**: P001
- **Status**: 已批准
- **Related ADR**: ADR-001

## 适用场景

新增 API endpoint、CRUD 业务逻辑

## 推荐结构

```
backend/src/
├── routes/<resource>.ts    # HTTP + JSON Schema only
├── schemas/<resource>.ts   # 共享 schema
├── services/<resource>.ts  # 业务逻辑
└── models/<resource>.ts    # Sequelize 模型
```

## 示例

参考 `backend/src/routes/health.ts` — 最小 endpoint，后续 feature 遵循相同分层。

## Agent 指令

- Backend Agent 新建 route 时必须同时创建/更新 schema
- DB 变更由 DB Agent 在 `migrations/` 完成，须 Human Approval
