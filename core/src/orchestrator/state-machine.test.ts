import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  nextPhase,
  shouldReturnToPlanFromContract,
  shouldEscalateToHuman,
  type WorkUnit,
} from "./state-machine.js";

const baseUnit = (): WorkUnit => ({
  id: "WU-1",
  featureId: "FEAT-1",
  phase: "CONTRACT",
  assignedAgent: "backend_agent",
  specPath: "docs/product-specs/features/FEAT-1",
  reviewRounds: 0,
  testRounds: 0,
  contractRounds: 0,
});

describe("state-machine CONTRACT phase", () => {
  it("PLAN transitions to CONTRACT", () => {
    assert.equal(nextPhase("PLAN", "PASS"), "CONTRACT");
  });

  it("CONTRACT PASS transitions to IMPLEMENT", () => {
    assert.equal(nextPhase("CONTRACT", "PASS"), "IMPLEMENT");
  });

  it("CONTRACT FAIL stays in CONTRACT for renegotiation", () => {
    assert.equal(nextPhase("CONTRACT", "FAIL"), "CONTRACT");
  });

  it("escalates after max contract rounds", () => {
    const unit = { ...baseUnit(), contractRounds: 3 };
    assert.equal(shouldEscalateToHuman(unit), true);
    assert.equal(shouldReturnToPlanFromContract(unit), true);
  });
});
