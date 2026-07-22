# ADR-002: Creator-Verifier 分离模式

- **状态**: 已接受
- **日期**: 2026-07-22
- **决策者**: Human Architect

## 背景

Agent 自报「测试通过」不可靠。独立验证比自验证正确率提升 12%–26%。

## 决策

采用 Creator-Verifier Pattern：

```
Coding Agent → Review Agent → Test Agent → Merge
```

- Test / Review Agent 使用**独立 context**（最好不同模型）
- Orchestrator **独立运行** `npm test`，不信子 Agent 自报

## 理由

- 对抗性 Review 可发现 Creator 盲区
- 机械验证（测试、lint）优于 LLM-as-Judge

## Agent 指令

- Coding Agent：实现后不得自行 declare done
- Review Agent：只读，须给出 file:line 证据
- Test Agent：先写测试（TDD），再验证实现
- Orchestrator：所有 Gate 通过才允许 COMMIT
