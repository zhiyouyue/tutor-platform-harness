---
name: clean-architecture
description: Apply Dependency Rule for Fastify+React stack — routes/services/models layering, inward dependencies, business logic independent of Sequelize and HTTP. Use when deciding where code belongs or reviewing module boundaries.
license: MIT
metadata:
  author: wondelai (adapted for tutor-platform-harness)
  version: "1.0.0-harness"
---

# Clean Architecture — Harness 适配

**依赖规则**：源码依赖指向内层。内层不知道外层。

## Harness 同心圆映射

```
┌─────────────────────────────────────┐
│  Frameworks: Fastify, React, Vite │  外层
├─────────────────────────────────────┤
│  Adapters: routes/, components/    │
├─────────────────────────────────────┤
│  Use Cases: services/              │
├─────────────────────────────────────┤
│  Entities: 领域规则（纯函数/types）│  内层
├─────────────────────────────────────┤
│  Models: Sequelize（持久化细节）    │  最外持久化
└─────────────────────────────────────┘
```

> 注：Harness  pragmatic 简化 — Sequelize models 在 service 层直接使用，不强制 Repository interface 除非 ≥2 存储实现。

## 快速诊断（7 项）

| 问题 | 否 → 动作 |
|------|----------|
| 能否不启 DB/HTTP 测业务规则？ | 逻辑在 route → 移到 service |
| 依赖是否向内？ | route import model → 违反 BE-001 |
| 换 DB 是否不动业务？ | ORM 类型泄漏到 service 返回值 → 用 DTO |
| Use case 是否不知 HTTP？ | service 用 request 对象 → 改签名 |
| Framework 是否在最外圈？ | React 里写业务规则 → 移到 hook/service |
| 组件图无环？ | 循环 import → 提取 shared 或 invert |
| 组装在 composition root？ | route 内 new 很多 deps → 考虑 factory |

## 常见错误

| 错误 | 修复 |
|------|------|
| ORM model 当 entity 到处传 | service 返回 plain DTO |
| 业务规则在 route handler | extract service function |
| Controller 知道 Sequelize | 仅 service import models |
| 过早 Repository interface | YAGNI，第三次用法再抽象 |

## SOLID（Harness 落地）

- **SRP** — 一个 service 函数一个用例
- **OCP** — 新 endpoint / 新函数扩展
- **LSP** — TS 子类型不加强前置条件
- **ISP** —  fat service 文件按 feature 拆
- **DIP** — 仅 multi-adapter 场景引入 interface

## 配对

- Rules: `rules/architecture-boundaries.mdc`, `rules/fastify-layer-discipline.mdc`
- Skill: `domain-modeling`, `codebase-design`

## 上游

改编自 [wondelai/skills clean-architecture](https://github.com/wondelai/skills) + Harness BE-001
