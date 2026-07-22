---
name: grill-me
description: Relentless Socratic interview to sharpen a plan or design before coding. Use at DECOMPOSE/PLAN when requirements are vague, before writing requirements.md or design.md, or when the user says "grill me" / "设计澄清".
disable-model-invocation: true
---

# Grill Me — 设计澄清

在写生产代码或 spec 之前，通过**逐问逐答**把决策树走完整。

## 何时使用（Harness PEV）

- **DECOMPOSE** 阶段：Issue → requirements.md 之前
- **PLAN** 阶段：design.md / ADR 之前有歧义
- 用户说「帮我理清需求」「设计还不清楚」

## 流程

1. **读已有上下文**：feature 四件套草稿、`docs/design-docs/architecture/` ADR、`knowledge/` 同类错误
2. **一次只问一个问题**，等用户回答后再问下一个
3. **事实自己查**：文件结构、现有 API、schema — 用工具查，别问用户
4. **决策交给用户**：每个分支给出推荐选项 + 理由，但等用户确认
5. **达到共识后**才提议写 requirements.md / design.md

## 问题维度（按 feature 裁剪）

- 谁用？成功标准是什么？
- 边界：In scope / Out of scope？
- Backend：新 route？改 service？Migration 需要 Human Approval？
- Frontend：新页面还是改组件？类型对齐哪个 schema？
- 测试：哪些 seams？integration vs unit？
- 风险：安全、性能、向后兼容？

## 输出

共识达成后：

```
建议下一步：
1. 写 docs/product-specs/features/<id>/requirements.md
2. 或运行 to-spec skill 合成 spec
```

## 禁止

- 一次抛 5+ 个问题
- 未共识就开始写代码
- 把决策只留在 chat（必须 check-in 到 docs/）

## 上游

改编自 [mattpocock/skills grill-me + grilling](https://github.com/mattpocock/skills)
