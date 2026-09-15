# Phase 1 第一阶段需求测试

本地 Chrome 浏览器 E2E，覆盖 **专家 → 管理员 → 运营** 三角色交付闭环。

## 快速复跑

```bash
# 终端 1：后端
cd backend && npx tsx src/server.ts

# 终端 2：前端
cd frontend && npm run dev

# 终端 3：E2E + 报告
cd frontend && npx playwright test e2e/phase1-delivery-chain.spec.ts --project=chrome
cd .. && node test/phase1/generate-reports.mjs
```

## 产物

| 路径 | 说明 |
|------|------|
| [SUMMARY.md](./SUMMARY.md) | 汇总报告（12/12 用例） |
| [reports/](./reports/) | 分 Feature 测试报告 |
| [screenshots/](./screenshots/) | 每步全页截图 |
| [backend-runtime.log](./backend-runtime.log) | 后端 Fastify 请求日志 |
| [html-report/index.html](./html-report/index.html) | Playwright HTML 报告 |
| [results.json](./results.json) | Playwright JSON 结果 |

## 测试链路

```
专家注册 → 能力保存 → 提交认证
    ↓
管理员审核通过
    ↓
运营创建学员/项目/发布
    ↓
专家接单 → 辅导记录 → 交付物 → 提交完成
    ↓
运营确认完成 → 专家收入账本 ¥5000
```

## 测试中发现并修复的缺陷

1. **POST 空 body + JSON Content-Type**：Fastify 返回 `Body cannot be empty` — 已在 `frontend/src/services/api.ts` 的 `apiFetch` 对无 body 的 POST 自动补 `{}`。
