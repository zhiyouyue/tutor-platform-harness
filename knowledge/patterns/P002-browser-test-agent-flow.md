# P002: Playwright Browser Test 流程

- **Pattern ID**: P002
- **Status**: 已批准
- **Related ADR**: ADR-002, ADR-003

## 架构

```
Requirement → Test Generation Agent → tests.md
                    ↓
            Browser Agent (Playwright)
                    ↓
         Screenshot + Logs → Vision Agent（可选）
                    ↓
              Bug Report Agent
```

## 目录

```
frontend/e2e/
├── <feature>.spec.ts
└── fixtures/
```

## 步骤模板

1. 打开页面
2. 执行用户操作
3. 断言 DOM / URL / API 响应
4. 失败时截图至 `test-results/`

## Agent 分工

- **Test Generation Agent**: 从 `tests.md` 生成 Playwright spec
- **Browser Agent**: 运行 E2E，不信 Coding Agent 自报
- **Vision Agent**（可选）: 截图 vs 预期 UI 对比
