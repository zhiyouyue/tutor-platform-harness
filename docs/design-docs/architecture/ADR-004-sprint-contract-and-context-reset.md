# ADR-004: Sprint Contract 与 Context Reset Handoff

- **状态**: 已接受
- **日期**: 2026-07-22
- **决策者**: Human Architect
- **关联**: ADR-003 Specification First · ADR-002 Creator-Verifier

## 背景

长 feature / 多 session 开发有两类失败：

1. **Spec 太粗**：Coding Agent 按自己理解实现，Test Agent 事后才发现验收标准不可测（Anthropic sprint contract 问题）
2. **Context 撑爆**：长 session 里模型失去连贯性或提前收工；compaction 无法完全消除 context anxiety

## 决策

### 1. 新增 CONTRACT 阶段

Work Unit 生命周期调整为：

```
DECOMPOSE → PLAN → CONTRACT → IMPLEMENT → VALIDATE → REVIEW → LEARN → COMMIT
```

- **PLAN 后、IMPLEMENT 前**：Coding Agent 起草 `sprint-contract.md`，Test Agent（+ 必要时 Review Agent）审批准
- **Gate**：`Status: APPROVED` 之前禁止写生产代码
- **协商失败**：最多 `HARNESS_MAX_CONTRACT_ROUNDS`（默认 3）轮，之后回 PLAN 或升级人类

### 2. Sprint Contract artifact

路径：`docs/product-specs/features/<feature-id>/sprint-contract.md`

模板：`docs/templates/feature/sprint-contract.md`

内容要求：

- 可验证 Acceptance Criteria（SC-*），与 `tests.md` 映射
- Negotiation Log 记录双边修订
- 最终 `Status: APPROVED` 供 Orchestrator 机械读取

### 3. Handoff artifact + Context Reset

路径：`docs/product-specs/features/<feature-id>/handoff.json`

模板：`docs/templates/handoff.json` · Schema：`core/src/orchestrator/handoff.schema.json`

**Reset 触发条件**（见 `core/src/orchestrator/context-reset.ts`）：

| 触发 | 默认阈值 | 环境变量 |
|------|---------|----------|
| Token budget | 150k | `HARNESS_MAX_TOKENS` |
| Step budget | 80 steps | `HARNESS_MAX_STEPS` |
| Phase boundary | PLAN / CONTRACT / VALIDATE / REVIEW 结束 | — |
| 强制 reset 优于 compaction | 关 | `HARNESS_PREFER_RESET=true` |

**Reset 流程**：

1. 当前 Agent 停止（不 replay chat history）
2. 写入 `handoff.json`（含 phase、activeTaskId、knownIssues、nextSteps）
3. 保存 git / worktree 状态
4. 新 session **仅加载** `resumeBundle`（默认含 AGENTS.md + handoff + sprint-contract + tasks + tests）
5. Pre-Flight：`knowledge/` + `agent-permissions.json`
6. 从 `handoff.phase` 继续

## 理由

- Sprint contract 把 ADR-003 四件套与单次 sprint 的「Done」桥接为**双边可 FAIL 的契约**
- Handoff 使状态外置到 repo，reset 后新 Agent 不依赖 context window 里的聊天
- 与 Anthropic long-running harness 的 file-based handoff 对齐，但保留本项目的 Spec First + 机械 Gate 优先

## Agent 指令

| 角色 | CONTRACT 阶段 |
|------|---------------|
| Coding Agent | 起草 / 修订 sprint-contract.md，引用 tasks.md 中当前 T-* |
| Test Agent | 审 SC 可测性，与 tests.md 一致，批准或 REQUEST_CHANGES |
| Review Agent | 触及 architecture 时审文件范围与设计一致性 |
| Orchestrator | `verifySprintContractApproved()` 通过才进入 IMPLEMENT；reset 前写 handoff |

## 禁止

- 无 `Status: APPROVED` 的 sprint-contract → 不得 IMPLEMENT
- Reset 后续跑时不得加载完整历史对话 — 只读 `resumeBundle`
- Handoff 不得省略 `nextSteps` 与 `progress.activeTaskId`
