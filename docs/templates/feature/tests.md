# [Feature 名称] — 测试计划

- **Feature ID**: `FEAT-XXX`
- **Test Agent**: 本文件批准后，Test Agent **先写测试**，Coding Agent 后实现

> **规则**: 无自动化测试 = 功能不存在

## 单元测试

| ID | 被测模块 | 场景 | 文件 |
|----|---------|------|------|
| UT-1 | | happy path | `backend/tests/unit/` |

## 集成 / API 测试

| ID | Endpoint | 断言 |
|----|----------|------|
| IT-1 | GET /api/... | 200 + schema |

## E2E / Browser 测试

| ID | 用户流程 | Playwright 步骤 |
|----|---------|----------------|
| E2E-1 | | 1. Open ... 2. Click ... |

## 验收映射

| 验收标准 (requirements.md) | 测试 ID |
|---------------------------|---------|
| AC-1 | UT-1, E2E-1 |

## Vision Agent 检查点（可选）

- 截图对比: ...
- 预期 UI: ...
