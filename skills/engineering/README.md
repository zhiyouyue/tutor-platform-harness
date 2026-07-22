# Agent Skills

Engineering skills for the Harness workflow. Download from [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/engineering):

| Skill | 用途 | 阶段 |
|-------|------|------|
| `grill-me` | 设计澄清 | PLAN |
| `write-a-prd` | 写 PRD → requirements.md | PLAN |
| `improve-codebase-architecture` | 大阶段重构 | Phase 4 |

## 安装

```bash
# 示例：克隆到 skills/engineering/
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/mattpocock/skills.git /tmp/mattpocock-skills
cd /tmp/mattpocock-skills && git sparse-checkout set skills/engineering
cp -r skills/engineering/* skills/engineering/
```

或手动复制 `grill-me`、`write-a-prd`、`improve-codebase-architecture` 到本目录。
