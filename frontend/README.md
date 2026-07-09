# Frontend — React + Vite 应用

由 **Frontend Agent** 维护。遵循 `docs/product-specs/` 与活跃 ExecPlan。

## 目录结构

```
frontend/
├── src/
│   ├── components/         # 可复用 UI 组件
│   ├── pages/              # 页面级组件（按路由）
│   ├── hooks/              # 自定义 React hooks
│   ├── services/           # API 调用层
│   ├── stores/             # 状态管理（Zustand 等）
│   ├── types/              # 共享 TypeScript 类型
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── e2e/                    # Playwright E2E（Browser Test Agent）
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Agent 约束

- 仅修改自己 worktree 下的 `frontend/`
- 任务前加载 `knowledge/frontend_mistakes.json`
- PR 必须通过 Browser Test Agent + Code Review Agent
- API 类型与 `backend/src/schemas/` 保持一致

## 开发

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build
npm run test
```

## E2E

```bash
npm run test:e2e
```
