# ADR-005: 阿里云 RTC AppServer Token 集成

- **状态**: 已接受
- **日期**: 2025-09-14
- **来源**: [tutor_platform](https://github.com/zhiyouyue/tutor_platform) F001

## 决策

- 使用 **@dingrtc/token-generator** 在服务端签发 Token
- 1v1 会话表 `rtc_sessions`，频道 ID 服务端生成
- WebSocket `/api/ws` 推送 `rtc.incoming` / `rtc.ended`
- Redis 可选（Token/来电缓存）；未启用时使用 noop cache

## 安全

- `ALIYUN_RTC_APP_KEY` 仅存在于 backend `.env`
- 仅会话参与者可 join/end

## 代码位置

`backend/src/routes/rtc.ts` · `services/rtcService.ts` · `repositories/rtcRepository.ts`
