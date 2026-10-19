# Phase 3 问题记录

| ID | 现象 | 根因 | 处理 |
|----|------|------|------|
| P3-BUG-01 | 集成测试 `phase3-po-decisions` 注册专家 `data` 为 null | 两个专家注册复用手机号尾段冲突 | 测试改用 `suffix + charCode` 生成唯一手机号；增加 `expect(201)` |
| P3-BUG-02 | 未执行 `07` 迁移时课次 PATCH/通知 API 500 | 缺列 `completion_notes` / 表 `user_notifications` | 部署清单增加 `07_phase3_appointments_notifications.sql` |
| P3-BUG-03 | Playwright 同时注册 `dismissDialogs` + `autoDialogs` | 同一 prompt 被处理两次 | E2E 按用例只注册一种 handler |

## 待办（产品）

- 邮件/短信通知（Q-P3-08）— 待阿里云配置后接入，当前仅站内。
