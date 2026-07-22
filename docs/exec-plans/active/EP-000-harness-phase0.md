# ExecPlan: Harness Phase 0 基础设施

- **状态**: 进行中
- **目标**: 建立 Agent OS 骨架，跑通最小 PEV 闭环

## 背景

见 [harness-design-summary.md](../design-docs/harness-design-summary.md)

## 里程碑

- [x] AGENTS.md 宪法
- [x] docs/ 骨架（ADR、SECURITY、QUALITY、模板）
- [x] knowledge/ 工程记忆
- [x] core/ Orchestrator 骨架
- [x] rules/ 权限边界
- [x] CI 门禁
- [ ] 第一个 feature 四件套示例
- [ ] mattpocock skills 下载

## 验证

```bash
npm install
npm test
npm run agent -- --dry-run
```

## Gate

- Build ✓
- Test ✓
- Spec 存在 ✓
