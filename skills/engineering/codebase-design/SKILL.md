---
name: codebase-design
description: Shared vocabulary for deep modules — module, interface, depth, seam, adapter, leverage, locality. Use when designing interfaces, finding seams, or when improve-codebase-architecture needs precise terms.
---

# Codebase Design — 深模块词汇

设计 **deep modules**：大量行为 behind 小 interface，放在 clean seam 上，通过 interface 可测。

##  glossary（必须精确使用）

| 术语 | 含义 | 避免说 |
|------|------|--------|
| **Module** | 有 interface + implementation 的单元 | component, service |
| **Interface** | 调用者需知的一切（签名、不变量、错误模式） | API（太窄） |
| **Depth** | interface 背后行为量 / interface 复杂度 | — |
| **Seam** | 可替换行为而不改调用点的地方 | boundary |
| **Adapter** | 在 seam 上满足 interface 的具体实现 | — |
| **Leverage** | 调用者从 depth 获得的 capability/学习成本比 | — |
| **Locality** | 变更集中在一处 | — |

## Deep vs Shallow

**Deep** — 小 interface，厚 implementation（目标）

**Shallow** — interface 几乎等于 implementation（避免）

## 原则

1. **Deletion test** — 删掉 module，复杂度消失=pass-through，应删；复杂度散到 N 处=earned keep
2. **Interface is test surface** — 测试与调用者过同一 seam
3. **One adapter = hypothetical seam; two = real seam** — 别为假想变化抽象

## Harness 映射

| 概念 | Fastify 栈 |
|------|-----------|
| Module | `user.service.ts` 或 cohesive route group |
| Interface | service 导出函数签名 + 抛出的 AppError |
| Seam | service 边界（route 只调 service） |
| Adapter | Sequelize model 访问封装在 service 内 |

## 可测试性三则

1. 依赖注入，不在 module 内 `new StripeClient()`
2. 优先返回结果而非 hidden side effect
3. 小 surface — 少方法、少参数

## Design-it-twice

重大 interface 设计时，并行想 2–3 种 radically different shapes，比 depth/locality/seam 位置。

## 配对

- `skills/engineering/improve-codebase-architecture/`
- `rules/architecture-boundaries.mdc`

## 上游

改编自 [mattpocock/skills codebase-design](https://github.com/mattpocock/skills)
