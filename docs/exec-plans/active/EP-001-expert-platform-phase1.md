# ExecPlan: 专家平台 Phase 1

- **状态**: 规划中
- **起始**: 2025-09-14
- **目标**: 四端（专家/运营/管理员/学员轻量）跑通完整交付闭环

## 背景

- 主 PRD: [PRD-20250914-phase1-master](../../product-specs/phase-1/PRD-20250914-phase1-master.md)
- 发现日志: [20250914-discovery-log](../../product-specs/phase-1/discovery/20250914-discovery-log.md)

## 里程碑

### M0 · 规格定稿
- [x] Phase 1 文档骨架
- [x] Blocking Q&A 全部完成（含 Q-004-FU~006-FU）
- [x] 主 PRD v1.0-rc
- [ ] Q-007 文件存储确认（建议 OSS）
- [ ] 管理员端 + 学员端 Figma 设计
- [ ] Figma Frame 清单 + PRD v1.0 正式批准
- [ ] ADR：阿里云 RTC 集成

### M1 · 基础设施
- [ ] 四端 frontend 脚手架（`apps/expert|ops|admin|student`）
- [ ] RBAC Auth（expert / ops / admin）
- [x] DB schema + migrations（`expert_platform`，`backend/sql/01_phase1_schema.sql`）
- [ ] DBA 授权 + `npm run db:setup` 本地落库
- [ ] 文件上传（Q-007）
- [ ] AliyunRtcMeetingProvider 适配器 + 短信 OTP 服务

### M2 · 专家入驻 + 管理员审核
- [ ] FEAT-P1-001 开放注册
- [ ] FEAT-P1-002 资料与能力
- [ ] FEAT-P1-003 认证（专家提交 + **管理员审核**）
- [ ] FEAT-P1-ADM 管理员 UI

### M3 · 运营派单 + 专家接单
- [ ] FEAT-P1-OPS 运营 UI（学员/项目/定价/派单）
- [ ] FEAT-P1-005/006 专家项目列表与详情
- [ ] FEAT-P1-004 专家工作台

### M4 · 交付链路
- [ ] FEAT-P1-008 辅导记录与交付（课件/内容上传）
- [ ] FEAT-P1-007 交付空间（专家↔运营、专家↔学员）
- [ ] FEAT-P1-STU 学员短信/链接登录 + 交付空间
- [ ] FEAT-P1-009 时间/预约/阿里云 RTC 1v1

### M5 · 完成与入账
- [ ] FEAT-P1-CMP 专家提交完成 → 运营确认 → 入账
- [ ] FEAT-P1-010 收入账本

### M6 · 收尾
- [ ] FEAT-P1-011 个人中心
- [ ] Figma 三端对齐
- [ ] 标准场景 E2E（§二十一）

## 开发优先级

```
Auth/RBAC → 专家入驻+管理员审核 → 运营派单 → 专家交付 → 消息/会议 → 收入账本
```

## Gate

- [ ] AC-P1-01 ~ AC-P1-11
- [ ] 运营无法调用 admin 审核 API（权限测试）
- [ ] CI 绿 + P0 sprint-contract APPROVED
