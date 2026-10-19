# Phase 2 测试与问题记录

| ID | 发现 | 严重度 | 状态 | 说明 |
|----|------|--------|------|------|
| P2-ISS-04 | 阿里云侧「自动发起云端录制」API | 低 | 部署项 | 回调与 `rtc_recordings` 已就绪；需在阿里云控制台配置录制模板并指向 `POST /api/v1/internal/rtc/recording-callback` |

## Phase 2.1 已关闭

| ID | 项 | 修复 |
|----|-----|------|
| P2-ISS-01 | 录制回调 → OSS 元数据 | `internal/rtc/recording-callback` + `rtc_recordings` + `project_files` |
| P2-ISS-02 | 前端 dingrtc | `MeetingRoom.tsx` + 学员课堂页 |
| P2-ISS-03 | 运营选 slot + blackout | `from-slot` API + `ScheduleManagement` UI |

## 历史已修复

| ID | 问题 | 修复 |
|----|------|------|
| P2-FIX-01 | migration 重复执行报错 | `run-sql.ts` 跳过已存在列/索引 |
| P2-FIX-02 | 有课次项目项目级+课次级双入账 | 有课次时项目 confirm 不再整单入账 |
| P2-FIX-03 | Phase1 E2E 运营导航文案变更失败 | 侧栏改为「学生/项目」 |
| P2-FIX-04 | Phase2 E2E `pickRole` 未导入 | `phase2-helpers.ts` 显式 import |
| P2-FIX-05 | Phase2 E2E 首页断言 strict 冲突 | 改为 `aside` 内「首页」 |
