# Sprint Contract — [任务 ID / Sprint 标题]

- **Feature ID**: `FEAT-XXX`
- **Work Unit ID**: `WU-XXX`
- **Sprint / Task Ref**: `T-1`（来自 `tasks.md`）
- **Status**: `DRAFT` | `IN_REVIEW` | `APPROVED` | `REJECTED`
- **Proposed by**: `backend_agent` | `frontend_agent`（Coding Agent）
- **Reviewed by**: `test_agent`（必须）· `review_agent`（触及架构时）

> **规则**：`Status: APPROVED` 之前，Coding Agent **不得**进入 `IMPLEMENT` 写生产代码。
> 本文件是 Generator ↔ Verifier 的双边契约，对齐 ADR-003 四件套与 ADR-004 handoff。

## 1. Scope（本 sprint 做什么）

一句话描述本 sprint 交付边界：

> …

**关联规格**（只引用，不重写）：

| 文档 | 章节 / ID |
|------|-----------|
| requirements.md | AC-… |
| design.md | §… |
| tasks.md | T-… |
| tests.md | UT-/IT-/E2E-… |

## 2. Deliverables

| ID | 交付物 | 路径 / 产物 | Owner |
|----|--------|-------------|-------|
| D-1 | | `backend/src/...` | backend_agent |

## 3. Acceptance Criteria（可验证、可 FAIL）

每条必须可机械验证或 Playwright 步骤化。**任一 SC 未达标 = sprint FAIL**。

| ID | Criterion | Verification | Threshold |
|----|-----------|--------------|-----------|
| SC-1 | | `npm test` / Playwright / API 断言 | MUST PASS |
| SC-2 | | | MUST PASS |

### 3.1 测试映射

| SC ID | tests.md ID | 自动化位置 |
|-------|-------------|-----------|
| SC-1 | UT-1 | `backend/tests/unit/...` |

## 4. Out of Scope

- …

## 5. Negotiation Log

| Round | Agent | Action | Notes |
|-------|-------|--------|-------|
| 1 | backend_agent | PROPOSED | 初稿 |
| 1 | test_agent | REQUEST_CHANGES | SC-2 缺少 API 失败路径 |
| 2 | backend_agent | REVISED | 补充 IT-2 |

**Action 枚举**: `PROPOSED` · `REVISED` · `REQUEST_CHANGES` · `APPROVED` · `REJECTED`

## 6. Approval

- [ ] **Test Agent** — 验收标准可测、与 `tests.md` 一致
- [ ] **Review Agent** — 架构 / 安全 / 文件范围（仅当触及 design.md 时）

**最终状态**（Orchestrator Gate 读取此行）:

```
Status: DRAFT
```

<!-- Gate 通过条件：上方 Status 为 APPROVED，且 Test Agent checkbox 已勾选 -->
