---
name: tdd
description: Test-driven development with red-green loop at pre-agreed seams. Use at IMPLEMENT when tests.md exists, or when user mentions TDD / red-green-refactor.
---

# TDD — Harness 实现循环

铁律 #4：**tests.md 先于代码**。本 skill 指导红-绿循环，不负责替 Orchestrator 跑测试。

## 前置

1. 读 `docs/product-specs/features/<id>/tests.md`
2. 与用户确认 **seams**（见 `rules/testing-tdd.mdc`）
3. 读 `CONTEXT.md` / ADR（词汇一致）

## 循环规则

1. **Red** — 写一个失败测试（描述行为，非实现）
2. **Green** — 最小代码通过
3. **一次一个垂直切片** — 禁止先写全测试再写全实现
4. **Refactor 在 REVIEW** — 实现循环内不过度重构

## Seam 指南（本栈）

| Seam | 测 | Mock |
|------|-----|------|
| Fastify route | status, body shape | mock service |
| Service | 业务规则 | mock Sequelize model |
| React component | 用户可见 UI | mock `services/api` |

## 反模式

- 测 private 函数
-  tautological assert（与实现同公式）
- Mock 内部 collaborator 导致 refactor 即碎
- 声称 pass 未跑 `npm test`

## 完成标准

- tests.md 中场景有对应测试
- Orchestrator Gate `npm test` PASS（Agent 不自报）
- 新 route 有 schema + integration test

## 配对 Rules

- `rules/testing-tdd.mdc`
- `rules/fastify-layer-discipline.mdc`

## 上游

改编自 [mattpocock/skills tdd](https://github.com/mattpocock/skills)
