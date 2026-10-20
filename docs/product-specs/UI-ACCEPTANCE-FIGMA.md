# UI 验收标准（蓝系设计 + Figma MCP）

## 1. 视觉原则

| 项 | 标准 |
|----|------|
| 主色 | **深蓝** `#0A2540` / `#0E3A66`（侧栏、标题） |
| 品牌蓝 | **主蓝** `#1565D8`、**浅蓝** `#E8F2FC` / `#F4F9FF`（背景、高亮） |
| 气质 | 干净、留白、卡片圆角 10–14px、轻阴影 |
| 体验 | 一屏一事；主按钮唯一；状态用 `ant-tag` 胶囊 |
| 令牌 | 仅使用 `frontend/src/index.css` 中 `--c-*`，禁止散落 hex（除 SVG 渐变例外） |

## 2. Figma MCP（when needed）

在以下情况 **必须** 走 Figma MCP 同步或重设计：

1. 新增整页 / 新角色主导航结构变更  
2. PO 要求与稿面像素对齐（重大改版）  
3. 验收 Fail：页面不符合本标准且无法仅用 CSS 令牌修复  

**推荐流程**

1. 读 Skill：`figma-design-to-code`（设计→代码）或 `figma-generate-design`（代码→设计）  
2. `create_session` → 目标文件：[Figma 参考稿](https://www.figma.com/design/6ioRMwGOMxkRXBbR14aOUR)（fileKey `6ioRMwGOMxkRXBbR14aOUR`）  
3. Web 页面：`generate_figma_design` 截稿 + `use_figma` 组件化（并行 workflow）  
4. 代码落地：只改 `index.css` 令牌与各页 `surface-card` / `page-shell` 布局  
5. 记录：更新 `test/frontend/UI-VERIFICATION-*.md` 与截图目录  

日常小改（色板、间距、文案）**不必** 每次写回 Figma，但需在 PR 说明「未触发 MCP 重设计」。

## 3. 页面覆盖清单

| 区域 | 路由/入口 | 页面文件 |
|------|-----------|----------|
| 公共 | 角色选择 | `App.tsx` |
| 公共 | 登录 | `auth/LoginPage.tsx` |
| 班主任 | 首页/学生/项目/课程/收入 | `ops/*` |
| 专家 | 工作台/项目/交付/能力/课表/收入/资料 | `expert/*` |
| 学员 | 主页/辅导/预约/消息/我的 | `student/*` |
| 管理员 | 认证/看板 | `admin/*` |
| 公共组件 | 通知/课堂 | `NotificationBell`, `MeetingRoom`, `AppointmentClassroom` |

## 4. 自动化验证

| 命令 | 用途 |
|------|------|
| `npm run build -w frontend` | TS + 生产构建 |
| `npm run test:e2e -w frontend -- ui-blue-theme` | 蓝系主题冒烟 + 截图 |
| `npm run test:e2e -w frontend -- phase3-po-features` | 管理员/班主任关键页 |

## 5. 与 Phase 3 Rubric 关系

本标准为 **GRADING-RUBRIC §E** 的权威说明；UI Fail 须修复后复跑 E2E 再标 Pass。
