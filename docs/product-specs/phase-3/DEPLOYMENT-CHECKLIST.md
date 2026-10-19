# Phase 3 部署待办（由您执行）

## 1. 数据库

- [ ] 已执行 Phase 1 schema 或增量脚本（`04`/`05`/`06`）  
- [ ] 在 **backend 目录**执行：  
  `npx tsx scripts/run-sql.ts sql/06_phase2_rtc_recordings.sql`  
- [ ] 确认 MySQL 账号与 `backend/.env` 中 `MYSQL_*` 一致  

## 2. 后端环境变量

- [ ] `JWT_SECRET`（生产强随机）  
- [ ] `ALIYUN_RTC_APP_ID` / `ALIYUN_RTC_APP_KEY`（真音视频）  
- [ ] `RTC_RECORDING_CALLBACK_SECRET`（与阿里云录制回调一致）  
- [ ] `OSS_*`（文件与录制存储）  
- [ ] `CORS_ORIGIN` = 前端正式域名  

## 3. 进程

- [ ] `npm run build -w backend && npm run start -w backend`（或 PM2）  
- [ ] `npm run build -w frontend`，静态资源由 Nginx/CDN 托管  
- [ ] 反向代理：`/api` → 后端 `:3000`  

## 4. 冒烟（上线后）

- [ ] 管理员登录 → 专家审核  
- [ ] 班主任 ops1 → 创建学生/项目/课次  
- [ ] 专家接受项目 → 标记课次完成  
- [ ] 班主任确认课次 → 收入页有变化  
- [ ] 学员魔法链接 → 我的课程 → 进入课堂（RTC 配好时）  

## 5. 安全

- [ ] 修改种子账号密码（ops1/admin/ops 等）  
- [ ] 关闭公网访问 MySQL  
- [ ] 录制回调 URL 仅阿里云 IP 或加 WAF  

## 6. 备份

- [ ] MySQL 自动备份策略  
- [ ] OSS 生命周期（录制文件）  

完成一项勾一项。开发侧测试：`npm run test -w backend` 应 35+ passed。
