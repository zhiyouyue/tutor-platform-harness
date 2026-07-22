# Engineering Skills — Harness PEV 工作流

> Skills 写「工作流」：用户或 Agent 按 PEV 阶段按需加载。
> 规则（法律）见 `rules/`；宪法见 `AGENTS.md`。

## PEV 阶段映射

| PEV 阶段 | Skill | 路径 |
|----------|-------|------|
| DECOMPOSE / 设计澄清 | grill-me | [grill-me/](./grill-me/SKILL.md) |
| PLAN / 写规格 | to-spec | [to-spec/](./to-spec/SKILL.md) |
| PLAN / 领域语言 | domain-modeling | [domain-modeling/](./domain-modeling/SKILL.md) |
| IMPLEMENT | tdd | [tdd/](./tdd/SKILL.md) |
| IMPLEMENT / REVIEW | clean-architecture | [clean-architecture/](./clean-architecture/SKILL.md) |
| REVIEW / 持续改进 | improve-codebase-architecture | [improve-codebase-architecture/](./improve-codebase-architecture/SKILL.md) |
| REVIEW | architecture-guard | [architecture-guard/](./architecture-guard/SKILL.md) |
| 设计 vocabulary | codebase-design | [codebase-design/](./codebase-design/SKILL.md) |

## 安装上游（可选）

```bash
# 与本地 skill 对照/更新时使用
npx skills add mattpocock/skills
npx skills add wondelai/skills/clean-architecture
```

本地 `skills/engineering/` 为 Harness 适配版，优先于上游 generic 版本。

## 来源

| Skill | 上游 |
|-------|------|
| improve-codebase-architecture, codebase-design, domain-modeling, grill-me, to-spec, tdd | [mattpocock/skills](https://github.com/mattpocock/skills) |
| clean-architecture | [wondelai/skills](https://github.com/wondelai/skills) |
| architecture-guard | [HoangNguyen0403/agent-skills-standard](https://github.com/HoangNguyen0403/agent-skills-standard) |
