# Kanban 工单

每个工单为**独立、可并行**的 Work Unit，须引用完整 feature 规格：

```
docs/product-specs/features/<feature-id>/
```

## 工单模板

```markdown
## [TICKET-001] 标题

- **Feature**: FEAT-XXX
- **Agent**: Backend Agent
- **Worktree**: `.worktrees/TICKET-001`
- **状态**: TODO | IN_PROGRESS | REVIEW | DONE

### 范围
- 文件: `backend/src/services/...`

### 验收标准
- [ ] 来自 requirements.md AC-x

### 依赖
- TICKET-000
```

生成 Kanban 时使用 Skill: `skills/engineering/`（mattpocock write-a-prd 完成后）
