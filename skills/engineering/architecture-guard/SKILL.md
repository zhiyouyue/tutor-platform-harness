---
name: architecture-guard
description: Audit PR diffs for architecture boundary violations, design simplicity, and dependency drift. Use at VALIDATE→REVIEW by Review Agent when layering or Fastify/React patterns may be affected.
metadata:
  triggers:
    keywords:
      - architecture review
      - layer violation
      - BE-001
      - boundary check
---

# Architecture Guard — Review Agent

**只审架构与设计**，不审 style/security（除非影响分层）。

## 角色

Review Agent @ VALIDATE → REVIEW Gate。Orchestrator 不信 Creator 自报。

## Budget

- ≤ 10 次文件读取
- 无 sub-agent
- 无 diff / 无 repo context → 返回 `BLOCKED`，不猜测

## Checklist

1. **栈检测** — Fastify + Sequelize + React/Vite
2. **分层** — BE-001: routes ↛ models；service ↛ request/reply；frontend ↛ DB
3. **简洁** — pass-through 3+ 层、单实现 interface、4+ 层单行为
4. **依赖漂移** — 新 package、新目录、无 ADR 的 pattern 变更
5. **Established pattern** — 与 `backend/src/routes/health.ts` 等 prior art 对比；偏离 → Suggestion + cite

## 输出

```text
### Architecture Review Findings
**Stack:** Fastify · Sequelize · React/Vite
**Layers Touched:** routes, services, frontend

#### Violations
- [Blocker] backend/src/routes/x.ts:8 — imports Model (BE-001)

#### Design Simplicity
- [Major] UserService — 3 pass-through wrappers to Model

#### What Looks Good
- JSON Schema on new endpoint
- tests.md scenarios covered in integration test
```

Severity: **Blocker** | **Major** | **Minor** | **Suggestion**

Blocker → REVIEW Gate **FAIL**

## 配对

- Rule: `rules/pr-review-architecture.mdc`
- Structure test: `npm run structure-test -w core`

## 上游

改编自 [agent-skills-standard specialist-architecture-guard](https://github.com/HoangNguyen0403/agent-skills-standard)
