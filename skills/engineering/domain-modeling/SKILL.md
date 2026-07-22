---
name: domain-modeling
description: Build and sharpen domain terminology in CONTEXT.md and record irreversible decisions in ADR. Use during design, grill-me, or when improve-codebase-architecture names new concepts.
---

# Domain Modeling — 领域语言与 ADR

主动维护**无实现细节**的领域词汇表与架构决策记录。

## Harness 文件布局

```
CONTEXT.md                              # 领域词汇表（项目或 feature 级）
docs/design-docs/architecture/          # 系统 ADR
docs/product-specs/features/<id>/design.md  # Feature 级设计
```

多 context 时可增 `CONTEXT-MAP.md`（按需）。

## 会话中行为

### 挑战术语
用户说「账户取消」— 若 glossary 区分 Customer / User，立即澄清。

### 锐化模糊词
「处理订单」→ 「PlaceOrder 用例还是 CancelOrder？」

### 场景压测
发明 edge case 场景 forcing 精确边界定义。

### 对照代码
用户描述与代码不符时指出：「代码里 cancel 是整单，你刚说支持部分取消？」

### 即时更新 CONTEXT.md
术语确定后**当场写入**，不批量拖延。

**CONTEXT.md 只放 glossary，不放实现细节、不放 spec 全文。**

## ADR 何时写（三条全满足才 offer）

1. **难逆转** — 以后改成本高
2. **无上下文会惊讶** — 后人会问「为什么这样」
3. **真实 trade-off** — 有备选方案且选了其一

路径：`docs/design-docs/architecture/ADR-NNN-<slug>.md`

## ADR 模板

```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated

## Context
...

## Decision
...

## Consequences
+ ...
- ...
```

## 与 PEV 关系

| 阶段 | 动作 |
|------|------|
| PLAN | 更新 CONTEXT.md + 必要 ADR |
| LEARN | Knowledge Curator 把 mistake → pattern → 可能新 ADR |

## 上游

改编自 [mattpocock/skills domain-modeling](https://github.com/mattpocock/skills)
