# 专家交付平台 Backend

Fastify 5 + MySQL（`expert_platform`）+ 阿里云 RTC（dingrtc AppServer Token）。

## 快速开始

```bash
cp .env.example .env   # 配置 MySQL / RTC
npm install

# 初始化数据库（需 expert_platform 库权限，见 sql/99_grant_writer.sql.example）
npm run db:setup

npm run dev
```

## 数据库

| 脚本 | 说明 |
|------|------|
| `npm run db:setup` | 建库 + Phase 1 schema + 字典 seed |
| `npm run db:schema` | 仅重建表结构（DROP + CREATE） |
| `npm run db:seed` | 仅字典 seed |

本地库名：**`expert_platform`**（与职优越主库 `zhiyouyue` 隔离）。

若 `zhiyouyue_writer` 无建库权限，请 DBA 执行 `sql/99_grant_writer.sql.example` 后重试。

## 开发账号（`db:setup` 自动 seed）

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 管理员 |
| ops1 | ops123456 | 运营 |

专家请在前端「专家 → 注册」。

## 环境变量

见 `.env.example`。MySQL 支持 `MYSQL_*` 或 `db_*` 两种命名。

## API

| 前缀 | 说明 |
|------|------|
| `GET /api/v1/health` | 健康检查（含 DB） |
| `POST /api/rtc/sessions` | 创建 1v1 RTC 会话（JWT，可选 `appointmentId`） |
| `POST /api/rtc/sessions/:channelId/join` | 获取入会 Token |
| `WS /api/ws?token=` | 来电/挂断 WebSocket 推送 |

## 架构

```
routes → services → repositories → mysql2 pool
```

RTC Token 由 `@dingrtc/token-generator` 在服务端签发，AppKey 不可暴露给前端。
