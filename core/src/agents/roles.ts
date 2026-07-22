/** Agent 角色定义 — 单一职责，禁止 Super Agent */
export const AGENT_ROLES = {
  orchestrator: {
    layer: "orchestration",
    responsibility: "任务分解、状态机、Gate 控制、独立验证",
    trustSelfReport: false,
  },
  requirement_agent: {
    layer: "orchestration",
    responsibility: "Issue → requirements.md + 验收标准",
    output: "docs/product-specs/features/*/requirements.md",
  },
  architect_agent: {
    layer: "orchestration",
    responsibility: "技术设计、ADR",
    output: "design.md + docs/design-docs/architecture/",
  },
  planner_agent: {
    layer: "orchestration",
    responsibility: "tasks.md 原子拆分",
    output: "tasks.md (< 500 lines/task)",
  },
  backend_agent: { layer: "execution", scope: "backend/" },
  frontend_agent: { layer: "execution", scope: "frontend/" },
  db_agent: { layer: "execution", scope: "migrations/", humanApproval: true },
  test_agent: {
    layer: "verification",
    responsibility: "先写测试，后验证 — 测试是 Source of Truth",
    trustSelfReport: false,
  },
  browser_test_agent: {
    layer: "verification",
    responsibility: "Playwright E2E + 截图",
  },
  review_agent: {
    layer: "review",
    checks: ["architecture", "maintainability", "security", "complexity"],
  },
  security_agent: { layer: "review", readOnly: true, canBlockMerge: true },
  knowledge_curator: {
    layer: "learning",
    responsibility: "Finding → knowledge/ → CI rule 升级",
  },
} as const;

export type AgentRole = keyof typeof AGENT_ROLES;
