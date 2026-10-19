# Phase 3 开发任务

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| T-P3-DOC-01 | 分角色使用手册 | ✅ | `user-manual/` |
| T-P3-DOC-02 | API 权限矩阵 | ✅ | `API-PERMISSIONS.md` |
| T-P3-DOC-03 | 待确认问题清单 | ✅ | `OPEN-QUESTIONS.md` |
| T-P3-DOC-04 | 部署待办（给用户） | ✅ | `DEPLOYMENT-CHECKLIST.md` |
| T-P3-OPS-01 | 班主任工作台按负责项目过滤 | ✅ | dashboard/projects/students/appointments |
| T-P3-OPS-02 | GET `/ops/projects/:id` | ✅ | |
| T-P3-OPS-03 | 班主任项目详情 UI | ⬜ | 待 Q-P3-02 |
| T-P3-EXP-01 | 专家课表：时间/进课堂/标记完成 | ✅ | Schedule + AppointmentClassroom |
| T-P3-STU-01 | 学员课表与完成状态文案 | ✅ | |
| T-P3-STU-02 | 学员课程状态（进行中细化） | 🟡 | 已完成/待确认 |
| T-P3-RBAC-01 | 班主任跨项目 403 集成测试 | ✅ | `rbac-ops-scope.test.ts` |
| T-P3-COMP-01 | 公司员工独立登录/看板 | ⛔ 不做 | Q-P3-01 选 A |
| T-P3-PRJ-01 | PATCH 改派专家 | ✅ | `PATCH /ops/projects/:id` |
| T-P3-FIN-01 | 成本/结算/结算状态 | ⛔ 延期 | Q-P3-04/05 |
| T-P3-EXC-01 | 课次延期/改期/未完成扣费 | ✅ | defer/reschedule/mark-incomplete |
| T-P3-EXP-02 | 课次完成记录 + 专家备注 | ✅ | completion-record + notes |
| T-P3-NOTIF-01 | 站内通知 | ✅ | `user_notifications` + 课次/改派事件 |
| T-P3-BI-01 | 管理员按专家看板 | ✅ | `GET /admin/dashboard/by-expert` |
| T-P3-TEST-01 | PO 决策集成测试 | ✅ | `phase3-po-decisions.test.ts` |
