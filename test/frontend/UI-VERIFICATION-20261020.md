# 前端 UI 验证记录（2026-10-20）

**设计标准**：[`UI-ACCEPTANCE-FIGMA.md`](../../docs/product-specs/UI-ACCEPTANCE-FIGMA.md)  
**色板版本**：`index.css` 蓝系令牌 v2  

## 构建

| 检查 | 结果 |
|------|------|
| `npm run build -w frontend` | ✅（见本次 commit 前本地执行） |

## 页面人工/代码审查

| # | 页面 | 蓝系令牌 | 布局整洁 | 备注 |
|---|------|----------|----------|------|
| 1 | 角色选择 `App.tsx` | ✅ | ✅ | 四角色同色系深浅区分 |
| 2 | 登录 `LoginPage.tsx` | ✅ | ✅ | ant-input / primary |
| 3 | 班主任 OpsLayout + 5 子页 | ✅ | ✅ | 深蓝侧栏 |
| 4 | 专家 ExpertLayout + 子页 | ✅ | ✅ | 顶栏通知 |
| 5 | 学员 StudentLayout + 5 子页 | ✅ | ✅ | 去 cyan 硬编码 |
| 6 | 管理员 AdminLayout + 认证/看板 | ✅ | ✅ | Logo 改品牌蓝 |
| 7 | NotificationBell | ✅ | ✅ | SVG 图标 |

## E2E（需 dev :5173 + :3000）

```bash
npm run test:e2e -w frontend -- ui-blue-theme
npm run test:e2e -w frontend -- phase3-po-features
```

截图：`test/frontend/screenshots/ui-blue/`

## Figma MCP

- 参考文件：https://www.figma.com/design/6ioRMwGOMxkRXBbR14aOUR  
- 本次为 **令牌级统一**，未触发全量 Figma 回写；新整页改版按 UI-ACCEPTANCE §2 执行。
