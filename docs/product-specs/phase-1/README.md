# 专家平台 · 第一阶段（Phase 1）产品规格索引

> **阶段代号**: P1  
> **起始日期**: 2025-09-14  
> **范围**: 专家端 + 运营端 + 管理员端 + 学员轻量端  
> **输入文档**: [专家平台 专家侧1.0规划说明](../../design-docs/专家平台%20专家侧1.0规划说明.md)

## 阶段目标

三端协作跑通：**专家交付闭环 + 运营派单协调 + 管理员认证审核**。

## 文档结构

| 文档 | 路径 |
|------|------|
| 主 PRD | [PRD-20250914-phase1-master.md](./PRD-20250914-phase1-master.md) |
| 发现/Q&A | [discovery/20250914-discovery-log.md](./discovery/20250914-discovery-log.md) |
| API 草案 | [design/20250914-api-draft.md](./design/20250914-api-draft.md) |
| Figma 映射 | [design/20250914-figma-mapping.md](./design/20250914-figma-mapping.md) |
| ExecPlan | [../../exec-plans/active/EP-001-expert-platform-phase1.md](../../exec-plans/active/EP-001-expert-platform-phase1.md) |

## Feature 拆分

| Feature ID | 名称 | 端 | 优先级 | 状态 |
|------------|------|-----|--------|------|
| FEAT-P1-001 | 认证与账号 | expert | P0 | 待起草四件套 |
| FEAT-P1-002 | 专家资料与能力 | expert | P0 | 待起草 |
| FEAT-P1-003 | 专家认证审核 | expert + admin | P0 | 待起草 |
| FEAT-P1-004 | 工作台 | expert | P0 | 待起草 |
| FEAT-P1-005 | 我的项目 | expert | P0 | 待起草 |
| FEAT-P1-006 | 项目详情与节点 | expert | P0 | 待起草 |
| FEAT-P1-007 | 交付空间 | all | P1 | 待起草 |
| FEAT-P1-008 | 辅导记录与交付 | expert | P0 | 待起草 |
| FEAT-P1-009 | 时间/预约/会议 | expert + ops | P1 | 待起草 |
| FEAT-P1-010 | 收入账本 | expert + admin | P1 | 待起草 |
| FEAT-P1-011 | 个人中心 | expert | P1 | 待起草 |
| FEAT-P1-OPS | 运营后台 | ops | P0 | 待起草 |
| FEAT-P1-ADM | 管理员后台 | admin | P0 | 待起草 |
| FEAT-P1-STU | 学员轻量端 | student | P1 | 待起草 |
| FEAT-P1-CMP | 项目完成与入账 | expert + ops | P0 | 待起草 |

## 当前状态

- **2025-09-14 AM**: 初始化文档骨架
- **2025-09-14 PM**: PO 确认 Q-001~006；三端 UI；运营/管理员分权
- **2025-09-14 PM**: Q-004-FU~006-FU 完成；**PRD v1.0-rc**；Blocking Q&A 全部关闭

## 待 PO 补充（非阻塞）

- [ ] Q-007：文件存储（建议阿里云 OSS）
- [ ] Q-009 / Q-010：终端响应式、字典配置
- [ ] 管理员端 + 学员端 Figma 设计稿
- [ ] Figma Frame 清单 / 查看权限
- [ ] 阿里云 RTC 现有集成代码或 SDK 文档（IMPLEMENT 前）
