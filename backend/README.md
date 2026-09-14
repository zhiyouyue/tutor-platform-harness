# 导师平台 Backend

Fastify 5 + MySQL + 阿里云 RTC（dingrtc AppServer Token）。

## 快速开始

```bash
cp .env.example .env   # 配置 MySQL / RTC
npm install
npm run db:rtc         # 创建 rtc_sessions 表（库名 tutoring_platform，需已有 users 表）
npm run dev
```

## 环境变量

见 `.env.example`。MySQL 支持 `MYSQL_*` 或 `db_*` 两种命名。

## API

| 前缀 | 说明 |
|------|------|
| `GET /api/v1/health` | 健康检查（含 DB） |
| `POST /api/rtc/sessions` | 创建 1v1 RTC 会话（JWT） |
| `POST /api/rtc/sessions/:channelId/join` | 获取入会 Token |
| `WS /api/ws?token=` | 来电/挂断 WebSocket 推送 |

视频模块源码来自 [tutor_platform](https://github.com/zhiyouyue/tutor_platform)，已 TypeScript 化并迁入本目录。

## 架构

```
routes → services → repositories → mysql2 pool
```

RTC Token 由 `@dingrtc/token-generator` 在服务端签发，AppKey 不可暴露给前端。
