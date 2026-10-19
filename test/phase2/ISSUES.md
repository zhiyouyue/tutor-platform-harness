# Phase 2 测试与问题记录

| ID | 发现 | 严重度 | 状态 | 说明 |
|----|------|--------|------|------|
| P2-ISS-01 | 云端录制未接阿里云录制回调 | 高 | 待做 | 设计见 `docs/product-specs/phase-2/design/20251019-rtc-slot-recording.md` §4 |
| P2-ISS-02 | 前端 Web SDK 未嵌入 dingrtc | 中 | 待做 | 课堂页仅完成 join-token 与友好提示 |
| P2-ISS-03 | 运营选 slot 自动校验 blackout | 低 | 待做 | 已提供 `GET /ops/experts/:id/schedule-slots`，UI 待绑定 |

## 已修复

| ID | 问题 | 修复 |
|----|------|------|
| P2-FIX-01 | migration 重复执行报错 | `run-sql.ts` 跳过已存在列/索引 |
| P2-FIX-02 | 有课次项目项目级+课次级双入账 | 有课次时项目 confirm 不再整单入账 |
| P2-FIX-03 | Phase1 E2E 运营导航文案变更失败 | 侧栏改为「学生/项目」；按钮「添加」exact |
| P2-FIX-04 | Phase2 E2E `pickRole` 未导入 | `phase2-helpers.ts` 显式 import |
| P2-FIX-05 | Phase2 E2E 首页断言 strict 冲突 | 改为 `aside` 内「首页」 |
