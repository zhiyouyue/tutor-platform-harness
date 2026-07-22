# Knowledge Base — 工程记忆系统

Agent 必须从错误中学习。Review/Test 失败须写入本目录，供未来 Agent Pre-Flight 检索。

## 目录结构

```
knowledge/
├── README.md                 # 本文件
├── security_rules.json       # 安全规则（机器可读）
├── backend_mistakes.json     # 后端错误索引
├── frontend_mistakes.json    # 前端错误索引
├── mistakes/                 # 详细 Finding（Markdown）
│   └── M001-*.md
└── patterns/                 # 已批准模式
    └── P001-*.md
```

## Finding 格式（JSON 索引）

每条 mistake 在 JSON 中登记，详细分析放在 `mistakes/`：

```json
{
  "rule_id": "BE-001",
  "severity": "HIGH",
  "category": "Architecture",
  "file": "routes/user.ts",
  "line": 42,
  "problem": "Database query inside route handler",
  "recommendation": "Move to service + repository layer",
  "times_detected": 1,
  "enforcement": "structure-test-no-db-in-routes",
  "mistake_doc": "knowledge/mistakes/M001-db-in-controller.md"
}
```

## 写入流程

```
Review/Test 失败
    → Review Agent 写 mistakes/Mxxx.md
    → Knowledge Curator 更新 *.json 索引
    → 重复 ≥3 次 → 升级为 rules/ linter / CI block
```

## Pre-Flight 检索

Coding Agent 任务前必须加载：

1. `knowledge/security_rules.json`
2. `knowledge/{backend|frontend}_mistakes.json`（按领域）
3. 相关 `patterns/` 文档

## Pattern 格式

已批准的做法，供 Agent 复制而非重新发明：

- 问题域
- 推荐结构
- 示例路径
- 相关 ADR
