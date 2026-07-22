# P003: Sprint Contract + Context Reset Handoff

- **Pattern ID**: P003
- **Status**: 已批准
- **Related ADR**: ADR-003, ADR-004

## 问题

- 四件套是 feature 级 spec，缺少 **单次 sprint 的双边 Done 定义**
- 长 session context 撑爆，compaction 无法消除 context anxiety

## 架构

```
PLAN (四件套齐全)
    ↓
CONTRACT — Coding Agent 起草 sprint-contract.md
    ↓         Test Agent 审 SC-* → Status: APPROVED
IMPLEMENT
    ↓
... VALIDATE → REVIEW ...
    ↓
[可选] Context Reset → handoff.json → 新 session 读 resumeBundle
```

## 文件

| 文件 | 用途 |
|------|------|
| `docs/templates/feature/sprint-contract.md` | CONTRACT 模板 |
| `docs/templates/handoff.json` | Reset 状态模板 |
| `core/src/orchestrator/state-machine.ts` | CONTRACT phase |
| `core/src/orchestrator/handoff.ts` | Handoff 解析 / 校验 |
| `core/src/orchestrator/context-reset.ts` | Reset 触发策略 |
| `core/src/gates/quality-gates.ts` | `verifySprintContractApproved()` |

## CONTRACT 流程

1. Coding Agent 从 `tasks.md` 取当前 `T-*`，起草 `sprint-contract.md`（Status: DRAFT）
2. Test Agent 检查每条 SC-* 是否可测、是否映射 `tests.md`
3. 修订写入 Negotiation Log，直至 `Status: APPROVED`
4. Orchestrator Gate 通过后进入 IMPLEMENT

## Context Reset 流程

1. `shouldContextReset()` 检测 token/step/phase boundary
2. 写 `handoff.json`（含 phase、activeTaskId、knownIssues、nextSteps）
3. 新 session 加载 `resumeBundle`，不加载历史对话
4. Pre-Flight：`knowledge/` + permissions

## 环境变量

| 变量 | 默认 | 含义 |
|------|------|------|
| `HARNESS_MAX_CONTRACT_ROUNDS` | 3 | CONTRACT 协商上限 |
| `HARNESS_MAX_TOKENS` | 150000 | Reset token 阈值 |
| `HARNESS_MAX_STEPS` | 80 | Reset step 阈值 |
| `HARNESS_PREFER_RESET` | false | 强制 reset 优于 compaction |
