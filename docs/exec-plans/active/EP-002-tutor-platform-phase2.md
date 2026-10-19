# ExecPlan: 导师平台 Phase 2

- **状态**: 执行中
- **起始**: 2025-10-19
- **目标**: 课次闭环 + 学员课表真实数据 + Phase 1 能力回归

## 背景

- PRD: [PRD-20251019-phase2-master](../../product-specs/phase-2/PRD-20251019-phase2-master.md)
- 矩阵: [20251019-feature-matrix-status](../../product-specs/phase-2/20251019-feature-matrix-status.md)

## 里程碑

### M0 · 规格
- [x] Phase 2 README + PRD 草案
- [x] 功能矩阵对照 + Phase 3 backlog
- [x] PO 确认 §9（见 po-decisions-log）

### M1 · 数据层
- [x] `04_phase2_course_extensions.sql`
- [x] 更新 `01_phase1_schema.sql` 新装一致

### M2 · 后端
- [x] appointmentService + ops/student/project 路由
- [x] students/import
- [x] ops/finance/summary

### M3 · 前端
- [x] ops ScheduleManagement 创建课次
- [x] expert Schedule 完成课次 + 链接
- [x] student Schedule API

### M4 · 验证
- [x] `course-flow.test.ts`（22/22 backend 通过）
- [ ] `phase2-course-chain.spec.ts`（冒烟待跑）
- [ ] `test/phase2/SUMMARY.md`

## 任务看板（Phase 2 范围内）

| ID | 任务 | 负责层 | 状态 |
|----|------|--------|------|
| T-P2-01 | migration meeting_url + 完成时间戳 | DB | 待办 |
| T-P2-02 | ops 创建/确认课次 API | BE | 待办 |
| T-P2-03 | student 课次列表 API | BE | 待办 |
| T-P2-04 | expert 完成课次 API | BE | 待办 |
| T-P2-05 | import students | BE | 待办 |
| T-P2-06 | finance summary | BE | 待办 |
| T-P2-07 | 三端 UI 接线 | FE | 待办 |
| T-P2-08 | 集成 + E2E | Test | 待办 |

### M5 · RTC + 录制（PO 确认 IN）
- [ ] FEAT-P2-RTC slot 排课 + join-token + MeetingRoom
- [ ] 云录制 OSS + AC-P2-05

### M6 · 课次入账
- [x] FEAT-P2-INC ops 确认课次写 income_lines + AC-P2-06（方案 A）

## Gate

- [x] AC-P2-01 ~ AC-P2-03
- [ ] AC-P2-05
- [x] AC-P2-06
- [x] `npm run test -w backend` 绿（课次闭环；入账/RTC 待补测）
