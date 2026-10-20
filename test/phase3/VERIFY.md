# Phase 3 验证流水线

```
PRD → 开发 → 单元/集成测试 → Grading Rubric → 复测 → 完成
```

| 阶段 | 产物 |
|------|------|
| PRD | `docs/product-specs/phase-3/PRD-phase3.md` |
| 开发 | backend `07` 迁移 + API；frontend 详情/铃铛/学员状态 |
| 测试 | `backend/tests/unit/*`、`integration/phase3-*`；`npm run test:coverage` |
| 检查 | `docs/product-specs/phase-3/GRADING-RUBRIC.md` |
| E2E | `frontend/e2e/phase3-po-features.spec.ts` → `test/phase3/screenshots/` |

**最近自动化结果（2026-10-20）**：backend **53 passed**；coverage 子集 **~93% lines**；frontend **build OK**。
