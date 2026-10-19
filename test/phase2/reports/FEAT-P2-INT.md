# Phase 2 集成测试报告

- **执行时间**: 2026-10-19
- **命令**: `npm run test -w backend`
- **总体结论**: ✅ **30 passed**

## 课次主链路 (`course-flow.test.ts`)

| # | 场景 | 结果 |
|---|------|------|
| 1 | 运营创建课次 | PASS |
| 2 | 学员课表可见 | PASS |
| 3 | 专家标记完成 | PASS |
| 4 | 运营确认并入账 | PASS |
| 5 | 收入汇总 | PASS |
| 6 | 运营财务摘要 | PASS |
| 7 | 批量导入学员 | PASS |
| 8 | join-classroom（未配置 RTC 时友好提示） | PASS |

## 边界 (`course-flow-boundary.test.ts`)

| # | 场景 | 结果 |
|---|------|------|
| 1 | 仅专家完成、运营未确认 → 无入账 | PASS |
| 2 | 三分拆总价 1000（333+333+334） | PASS |
| 3 | 导入重复手机号失败计数 | PASS |
| 4 | 双确认后 income_lines 唯一 appointment_id | PASS |

## 单元

- `sessionIncomeService.test.ts` — 方案 A 分摊算法 ✅
