# [Feature 名称] — 任务拆分

- **Feature ID**: `FEAT-XXX`
- **Planner**: Planner Agent

> 每个任务：< 500 行 · < 1 天 · 单一职责 · 独立可验证
>
> **CONTRACT 阶段**：每个进行中的任务须对应一份 `sprint-contract.md`（`Status: APPROVED` 后再 IMPLEMENT）。见 ADR-004。

## 任务列表

| ID | 任务 | Agent | 文件范围 | DoD | 依赖 |
|----|------|-------|---------|-----|------|
| T-1 | | Backend | `backend/src/services/` | 测试通过 | — |
| T-2 | | Frontend | `frontend/src/pages/` | E2E 通过 | T-1 |

## T-1: [任务标题]

**描述**: ...

**Definition of Done**:
- [ ] 单元测试
- [ ] Review APPROVED
- [ ] 无 security finding

**Human Approval Required**: 否 | 是（migration / breaking API）
