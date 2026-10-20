# Phase 3 — 产品交付与使用手册

> **状态：Phase 3 已关闭（2026-10-20）** — 见 [GRADING-RUBRIC.md](./GRADING-RUBRIC.md) DoD。  
> **上一阶段**：[Phase 2 关闭清单](../phase-2/TASKS-phase2-remaining.md)（任务已与 Phase 3 对齐）。

> **目标**：完成 PO 功能矩阵中「进行中 / 下一阶段做」项；产出**分角色使用手册**与**接口权限文档**；剩余业务规则通过 [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 逐项确认。

## 文档索引

| 文档 | 用途 |
|------|------|
| **[PRD-phase3.md](./PRD-phase3.md)** | **Phase 3 产品需求（FR/范围/DoD）** |
| [GRADING-RUBRIC.md](./GRADING-RUBRIC.md) | 验收打分与一键验证命令 |
| [20251019-feature-matrix.md](./20251019-feature-matrix.md) | 全矩阵 + 工程状态 |
| [TASKS-phase3.md](./TASKS-phase3.md) | 开发任务与进度 |
| [API-PERMISSIONS.md](./API-PERMISSIONS.md) | 接口 × 角色权限（安全验收依据） |
| [user-manual/README.md](./user-manual/README.md) | 产品使用手册总览 |
| [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | 待 PO 确认问题 |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | **您**执行的部署待办 |

## 角色与系统入口

| 角色 | 登录入口文案 | 说明 |
|------|--------------|------|
| 管理员 `admin` | 管理员 Admin | 专家认证审核 |
| 班主任 `ops` | 运营 Ops | 学生/项目/课次/收入（当前=公司后台班主任合一） |
| 专家 `expert` | 专家 Expert | 项目交付与课表 |
| 学员 `student` | 学员 Student | 课表与在线课堂 |

> **Phase 3 暂定**：「公司后台员工」与「班主任」共用 `ops` 账号体系；独立 `company_staff` 见 OPEN-QUESTIONS Q-P3-01。
