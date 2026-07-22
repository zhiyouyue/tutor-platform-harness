import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { WorkUnitPhase } from "./state-machine.js";
import { PHASE_ENTRY_REQUIREMENTS } from "./state-machine.js";

/** Repo root — core/src/orchestrator → ../../../ */
export const HARNESS_ROOT = join(import.meta.dirname, "../../..");

const SKILLS_BASE = "skills/engineering";
const RULES_BASE = "rules";

export interface SkillRef {
  name: string;
  /** Directory under repo root, e.g. skills/engineering/grill-me */
  dir: string;
}

export interface LoadedSkill extends SkillRef {
  skillPath: string;
  content: string;
}

export interface PhaseLoadout {
  phase: WorkUnitPhase;
  featureId: string;
  assignedAgent: string;
  skills: LoadedSkill[];
  rules: string[];
  preflight: string[];
  missing: string[];
  entryRequirements: string[];
}

/** Primary + optional skills per PEV phase — keep in sync with AGENTS.md */
export const PHASE_SKILLS: Record<WorkUnitPhase, SkillRef[]> = {
  DECOMPOSE: [{ name: "grill-me", dir: `${SKILLS_BASE}/grill-me` }],
  PLAN: [
    { name: "to-spec", dir: `${SKILLS_BASE}/to-spec` },
    { name: "domain-modeling", dir: `${SKILLS_BASE}/domain-modeling` },
    { name: "codebase-design", dir: `${SKILLS_BASE}/codebase-design` },
  ],
  CONTRACT: [
    { name: "to-spec", dir: `${SKILLS_BASE}/to-spec` },
    { name: "tdd", dir: `${SKILLS_BASE}/tdd` },
  ],
  IMPLEMENT: [
    { name: "tdd", dir: `${SKILLS_BASE}/tdd` },
    { name: "clean-architecture", dir: `${SKILLS_BASE}/clean-architecture` },
    { name: "codebase-design", dir: `${SKILLS_BASE}/codebase-design` },
  ],
  VALIDATE: [{ name: "tdd", dir: `${SKILLS_BASE}/tdd` }],
  REVIEW: [
    { name: "architecture-guard", dir: `${SKILLS_BASE}/architecture-guard` },
    { name: "improve-codebase-architecture", dir: `${SKILLS_BASE}/improve-codebase-architecture` },
  ],
  LEARN: [{ name: "domain-modeling", dir: `${SKILLS_BASE}/domain-modeling` }],
  COMMIT: [],
};

/** Rules to attach per phase — paths relative to repo root */
export const PHASE_RULES: Record<WorkUnitPhase, string[]> = {
  DECOMPOSE: [`${RULES_BASE}/anti-overengineering.mdc`, `${RULES_BASE}/llm-anti-patterns.mdc`],
  PLAN: [`${RULES_BASE}/anti-overengineering.mdc`, `${RULES_BASE}/api-design.mdc`],
  CONTRACT: [
    `${RULES_BASE}/anti-overengineering.mdc`,
    `${RULES_BASE}/testing-tdd.mdc`,
    `${RULES_BASE}/api-design.mdc`,
  ],
  IMPLEMENT: [
    `${RULES_BASE}/architecture-boundaries.mdc`,
    `${RULES_BASE}/fastify-layer-discipline.mdc`,
    `${RULES_BASE}/api-design.mdc`,
    `${RULES_BASE}/error-handling.mdc`,
    `${RULES_BASE}/react-vite-frontend.mdc`,
    `${RULES_BASE}/testing-tdd.mdc`,
  ],
  VALIDATE: [`${RULES_BASE}/testing-tdd.mdc`],
  REVIEW: [
    `${RULES_BASE}/pr-review-architecture.mdc`,
    `${RULES_BASE}/llm-anti-patterns.mdc`,
    `${RULES_BASE}/architecture-boundaries.mdc`,
  ],
  LEARN: [`${RULES_BASE}/llm-anti-patterns.mdc`],
  COMMIT: [],
};

/** Always load before any phase dispatch */
export const PREFLIGHT_PATHS = [
  "AGENTS.md",
  `${RULES_BASE}/agent-permissions.json`,
  `${RULES_BASE}/rule-index.mdc`,
] as const;

export function skillMdPath(ref: SkillRef, root = HARNESS_ROOT): string {
  return join(root, ref.dir, "SKILL.md");
}

export function loadSkill(ref: SkillRef, root = HARNESS_ROOT): LoadedSkill | null {
  const skillPath = skillMdPath(ref, root);
  if (!existsSync(skillPath)) return null;
  return {
    ...ref,
    skillPath,
    content: readFileSync(skillPath, "utf-8"),
  };
}

export function getSkillsForPhase(phase: WorkUnitPhase): SkillRef[] {
  return PHASE_SKILLS[phase];
}

export function getRulesForPhase(phase: WorkUnitPhase): string[] {
  return PHASE_RULES[phase];
}

export interface PrepareLoadoutInput {
  phase: WorkUnitPhase;
  featureId: string;
  assignedAgent: string;
  specPath?: string;
}

/** Resolve skills + rules + preflight for Orchestrator dispatch */
export function preparePhaseLoadout(
  input: PrepareLoadoutInput,
  root = HARNESS_ROOT,
): PhaseLoadout {
  const missing: string[] = [];
  const skills: LoadedSkill[] = [];

  for (const ref of getSkillsForPhase(input.phase)) {
    const loaded = loadSkill(ref, root);
    if (loaded) {
      skills.push(loaded);
    } else {
      missing.push(skillMdPath(ref, root));
    }
  }

  const preflight: string[] = [...PREFLIGHT_PATHS];
  if (input.specPath) {
    preflight.push(input.specPath);
  } else if (input.featureId) {
    preflight.push(`docs/product-specs/features/${input.featureId}/`);
  }
  if (input.phase === "CONTRACT" && input.featureId) {
    preflight.push(`docs/product-specs/features/${input.featureId}/sprint-contract.md`);
  }
  if (input.phase === "IMPLEMENT" && input.featureId) {
    preflight.push(`docs/product-specs/features/${input.featureId}/handoff.json`);
  }

  for (const p of preflight) {
    if (!existsSync(join(root, p))) {
      missing.push(p);
    }
  }

  for (const rule of getRulesForPhase(input.phase)) {
    const abs = join(root, rule);
    if (!existsSync(abs)) {
      missing.push(rule);
    }
  }

  return {
    phase: input.phase,
    featureId: input.featureId,
    assignedAgent: input.assignedAgent,
    skills,
    rules: getRulesForPhase(input.phase),
    preflight,
    missing,
    entryRequirements: PHASE_ENTRY_REQUIREMENTS[input.phase] ?? [],
  };
}

/** Agent-facing brief — paths only, no full skill body (token-efficient dispatch) */
export function formatPhaseBrief(loadout: PhaseLoadout): string {
  const lines: string[] = [
    `# PEV Phase: ${loadout.phase}`,
    "",
    `Feature: ${loadout.featureId}`,
    `Agent: ${loadout.assignedAgent}`,
    "",
    "## Pre-Flight",
    ...loadout.preflight.map((p) => `- ${p}`),
    "",
    "## Skills (load SKILL.md before acting)",
    ...(loadout.skills.length
      ? loadout.skills.map((s) => `- **${s.name}**: \`${s.dir}/SKILL.md\``)
      : ["- _(none)_"]),
    "",
    "## Rules",
    ...(loadout.rules.length ? loadout.rules.map((r) => `- \`${r}\``) : ["- _(none)_"]),
  ];

  if (loadout.entryRequirements.length) {
    lines.push(
      "",
      "## Phase Entry Requirements",
      ...loadout.entryRequirements.map((f) => `- \`${f}\` (under feature spec dir)`),
    );
  }

  if (loadout.missing.length) {
    lines.push("", "## Missing (warn)", ...loadout.missing.map((m) => `- ${m}`));
  }

  return lines.join("\n");
}
