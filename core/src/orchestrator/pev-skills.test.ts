import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import {
  getSkillsForPhase,
  getRulesForPhase,
  preparePhaseLoadout,
  formatPhaseBrief,
  HARNESS_ROOT,
} from "./pev-skills.js";

describe("pev-skills", () => {
  it("maps DECOMPOSE to grill-me", () => {
    const skills = getSkillsForPhase("DECOMPOSE");
    assert.equal(skills.length, 1);
    assert.equal(skills[0]?.name, "grill-me");
  });

  it("maps REVIEW to architecture-guard and improve-codebase-architecture", () => {
    const skills = getSkillsForPhase("REVIEW");
    assert.deepEqual(
      skills.map((s) => s.name),
      ["architecture-guard", "improve-codebase-architecture"],
    );
  });

  it("loads existing skill files from repo", () => {
    const loadout = preparePhaseLoadout(
      { phase: "PLAN", featureId: "F001", assignedAgent: "architect_agent" },
      HARNESS_ROOT,
    );
    assert.ok(loadout.skills.length >= 2);
    assert.ok(loadout.skills.every((s) => s.content.includes("name:")));
    assert.ok(getRulesForPhase("IMPLEMENT").includes("rules/architecture-boundaries.mdc"));
  });

  it("formatPhaseBrief lists skill paths", () => {
    const loadout = preparePhaseLoadout(
      { phase: "IMPLEMENT", featureId: "F001", assignedAgent: "backend_agent" },
      HARNESS_ROOT,
    );
    const brief = formatPhaseBrief(loadout);
    assert.match(brief, /PEV Phase: IMPLEMENT/);
    assert.match(brief, /skills\/engineering\/tdd\/SKILL.md/);
  });

  it("reports missing paths for unknown feature preflight dir", () => {
    const loadout = preparePhaseLoadout(
      { phase: "COMMIT", featureId: "__nonexistent__", assignedAgent: "orchestrator" },
      HARNESS_ROOT,
    );
    assert.ok(
      loadout.missing.some((m) => m.includes("__nonexistent__") || m.includes("product-specs")),
    );
  });
});
