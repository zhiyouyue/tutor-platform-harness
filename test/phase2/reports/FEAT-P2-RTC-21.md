# Phase 2.1 测试报告 — RTC 档期 / 入会 / 录制元数据

- **执行时间**: 2026-10-19
- **总体结论**: ✅ **通过**

## 集成测试 `rtc-phase21.test.ts`

| 场景 | 结果 |
|------|------|
| 专家设置周一 19–21 档，运营 from-slot 创建课次 | PASS |
| 非开放时段创建 → 400 | PASS |
| join-classroom 创建/绑定 rtc_sessions | PASS |
| 录制回调写入 `rtc_recordings` + GET 列表 | PASS |

## 前端

- `MeetingRoom.tsx` + dingrtc 动态加载，生产 build 通过
- 运营 `ScheduleManagement` 按专家档期排课

## 部署说明

- 执行 `backend/sql/06_phase2_rtc_recordings.sql`
- 配置 `ALIYUN_RTC_APP_ID/KEY` 后真入会；`RTC_RECORDING_CALLBACK_SECRET` 供阿里云录制回调
- 云端「发起录制」仍须在阿里云控制台/录制模板侧配置（回调链路已就绪）
