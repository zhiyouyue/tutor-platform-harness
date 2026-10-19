# Phase 2 自动化测试

## 集成测试（无需浏览器）

```bash
cd backend
npm run test -- tests/integration/course-flow.test.ts
```

首次运行前，对已存在的库执行：

```bash
npm run db:schema   # 全量重建（开发）
# 或
tsx scripts/run-sql.ts sql/04_phase2_course_extensions.sql
tsx scripts/run-sql.ts sql/05_phase2_income_appointment.sql
```

## E2E（可选）

```bash
cd frontend
npx playwright test e2e/phase2-course-chain.spec.ts
```

报告输出：`test/phase2/reports/`、`test/phase2/screenshots/`
