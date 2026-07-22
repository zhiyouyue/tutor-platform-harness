---
name: improve-codebase-architecture
description: Scan codebase for deepening opportunities (shallow→deep modules), present HTML report, then grill through chosen candidate. Use weekly or after feature surge; respects ADR and CONTEXT.md.
disable-model-invocation: true
---

# Improve Codebase Architecture

发现**架构摩擦**，提出 **deepening opportunities** — 把 shallow module 变 deep，提升可测性与 AI 可导航性。

## 词汇

- 架构词：`skills/engineering/codebase-design/SKILL.md`
- 领域词：`CONTEXT.md`、`docs/design-docs/architecture/`

## 流程

### 1. Explore

**YAGNI 定范围** — 优先最近改动的 hot spots：

```bash
git log --oneline -30
```

读 `CONTEXT.md` 与触及区域的 ADR。

用 Explore subagent 有机.walk codebase，记录 friction：

- 理解一概念需跳转多少小文件？
- 哪些 module **shallow**（interface ≈ implementation）？
- 纯函数提取了但 bug 在调用方式（无 **locality**）？
- 哪些 seam 泄漏？
- 哪些 interface 难测？

对 suspect 跑 **deletion test**。

### 2. HTML 报告

写到 OS temp（**不进 repo**）：

```
%TEMP%/architecture-review-<timestamp>.html   # Windows
```

Tailwind CDN + 可选 Mermaid。每张 card：

- **Files** / **Problem** / **Solution** / **Benefits**（locality, leverage, 测试改善）
- **Before/After** 示意图
- **Strength**: Strong | Worth exploring | Speculative

用 CONTEXT 领域词 + codebase-design 架构词。

**ADR 冲突**：仅当 friction 足够重才标记「contradicts ADR-NNN — worth reopening because…」

报告完成后问用户：「Which candidate to explore?」

### 3. Grilling loop

用户选定后 → `skills/engineering/grill-me/` 走决策树：

- 约束、依赖、deepened module 形状
- seam 后面是什么、哪些测试 survive

边讨论边 `domain-modeling` 更新 CONTEXT.md / 提供 ADR。

## Harness 约束

- 重构 PR 仍 < 500 行或拆多 PR
- BE-001 重构后跑 `npm run structure-test -w core`
- 决策写入 ADR，不只 chat

## 频率

建议每 1–2 周或 feature 密集开发后跑一次。

## 上游

改编自 [mattpocock/skills improve-codebase-architecture](https://github.com/mattpocock/skills)
