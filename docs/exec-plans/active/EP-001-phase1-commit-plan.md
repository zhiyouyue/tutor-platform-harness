# Phase 1 分步提交计划

- **策略**：每步完成后本地调试通过 → 单次 git commit → 再进入下一步
- **库**：`expert_platform`（30 表）
- **联调**：后端 `/api/v1` + 前端逐步替换 mock

---

## 步骤总览

| Step | Commit 主题 | 后端 | 前端联调 | 验收 |
|------|-------------|------|----------|------|
| **0** | `feat(db): expert_platform schema` | DDL + setup 脚本 + 配置 | — | `npm run db:setup` 30 表 |
| **1** | `feat(auth): 登录注册与专家档案` | Auth + expert profile + admin 认证审核 | Login + Profile + Certifications | 注册→登录→改资料→提交认证→admin 审核 |
| **2** | `feat(capabilities): 字典与能力资产` | dict API + 4 关联表 CRUD | Capabilities 页 | 勾选能力保存并回显 |
| **3** | `feat(projects): 学员与项目` | ops students/projects + expert projects | Students/Projects 四页 | 运营建项目→专家接单 |
| **4** | `feat(delivery): 辅导记录与交付` | records + deliverables + files | ProjectDetail | 写记录、上传交付 |
| **5** | `feat(completion): 完成确认与收入` | completions + income_lines | Income + ops 确认 | 双确认入账 |
| **6** | `feat(collab): 消息预约与 RTC` | messages + appointments + rtc | DeliverySpace + Schedule | 发消息、预约、入会 |
| **7** | `feat(student): 学员登录与交付空间` | OTP/magic link | student 端 | 学员链接登录 |
| **8** | `refactor(frontend): expert/ops 命名对齐` | — | mentor→expert 目录与路由 | 四端命名一致 |

---

## 每步调试命令

```bash
# 后端
cd backend && npm run test && npm run build

# 前端
cd frontend && npm run build

# 数据库检查
node backend/scripts/inspect-db.mjs
```

---

## Commit 消息模板

```
feat(scope): 简短标题

- 后端：列出新增 routes/services/repositories
- 前端：列出联调页面
- 测试：通过的 test 文件
```

---

## 当前进度

- [x] Step 0 — `a90aeb2` schema 已落库
- [x] Step 1 — `655aeac` Auth + 专家档案 + admin 认证联调
- [ ] Step 2–8
