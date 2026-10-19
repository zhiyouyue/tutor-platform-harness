# Phase 2 测试汇总

- **更新时间**: 2026-10-19T03:15:26.894Z

## 集成测试（Vitest）

| 套件 | 说明 |
|------|------|
| course-flow.test.ts | 课次主链路 + 入账 |
| course-flow-boundary.test.ts | 双确认边界、三分拆 1000、导入重复 |
| project-flow.test.ts | Phase 1 回归 |

执行：`npm run test -w backend` → **30 passed**


## E2E 冒烟

- FEAT-P2-OPS 运营登录与首页: PASS
- FEAT-P2-STU 学生管理页: PASS
- FEAT-P2-SCH 课程管理页: PASS
- FEAT-P2-FIN 收入页: PASS

## 截图

- [FEAT-P2-FIN-finance.png](screenshots/FEAT-P2-FIN-finance.png)
- [FEAT-P2-OPS-dashboard.png](screenshots/FEAT-P2-OPS-dashboard.png)
- [FEAT-P2-SCH-schedule.png](screenshots/FEAT-P2-SCH-schedule.png)
- [FEAT-P2-STU-students.png](screenshots/FEAT-P2-STU-students.png)

## 已知问题

见 [ISSUES.md](./ISSUES.md)
