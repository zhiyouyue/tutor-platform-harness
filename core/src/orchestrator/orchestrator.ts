import type { GateResult, WorkUnit, WorkUnitPhase } from "./state-machine.js";
import {
  nextPhase,
  shouldEscalateToHuman,
  shouldReturnToPlanFromContract,
  PHASE_ENTRY_REQUIREMENTS,
} from "./state-machine.js";
import {
  formatPhaseBrief,
  preparePhaseLoadout,
  type PhaseLoadout,
  HARNESS_ROOT,
} from "./pev-skills.js";
import { AGENT_ROLES, type AgentRole } from "../agents/roles.js";

/** Default PEV phase when dispatching an agent role */
export const AGENT_DEFAULT_PHASE: Partial<Record<AgentRole, WorkUnitPhase>> = {
  requirement_agent: "DECOMPOSE",
  architect_agent: "PLAN",
  planner_agent: "PLAN",
  contract_proposer: "CONTRACT",
  contract_reviewer: "CONTRACT",
  backend_agent: "IMPLEMENT",
  frontend_agent: "IMPLEMENT",
  db_agent: "IMPLEMENT",
  test_agent: "VALIDATE",
  browser_test_agent: "VALIDATE",
  review_agent: "REVIEW",
  security_agent: "REVIEW",
  knowledge_curator: "LEARN",
};

export interface DispatchResult {
  unit: WorkUnit;
  loadout: PhaseLoadout;
  brief: string;
  escalated: boolean;
}

export interface OrchestratorOptions {
  root?: string;
}

export class Orchestrator {
  readonly root: string;

  constructor(options: OrchestratorOptions = {}) {
    this.root = options.root ?? HARNESS_ROOT;
  }

  createWorkUnit(params: {
    id: string;
    featureId: string;
    phase: WorkUnitPhase;
    assignedAgent: AgentRole;
  }): WorkUnit {
    return {
      id: params.id,
      featureId: params.featureId,
      phase: params.phase,
      assignedAgent: params.assignedAgent,
      specPath: `docs/product-specs/features/${params.featureId}/`,
      reviewRounds: 0,
      testRounds: 0,
      contractRounds: 0,
    };
  }

  /** Load skills + rules for current phase before agent dispatch */
  dispatch(unit: WorkUnit): DispatchResult {
    const loadout = preparePhaseLoadout(
      {
        phase: unit.phase,
        featureId: unit.featureId,
        assignedAgent: unit.assignedAgent,
        specPath: unit.specPath,
      },
      this.root,
    );

    return {
      unit,
      loadout,
      brief: formatPhaseBrief(loadout),
      escalated: shouldEscalateToHuman(unit),
    };
  }

  /** Advance state machine after gate; returns updated unit + loadout for new phase */
  advance(unit: WorkUnit, gate: GateResult): DispatchResult {
    const escalated = shouldEscalateToHuman(unit);
    if (escalated && gate === "FAIL") {
      return this.dispatch(unit);
    }

    const previous = unit.phase;
    const next = nextPhase(unit.phase, gate);

    if (next === "DONE") {
      const loadout = preparePhaseLoadout(
        { phase: "COMMIT", featureId: unit.featureId, assignedAgent: unit.assignedAgent, specPath: unit.specPath },
        this.root,
      );
      return {
        unit: { ...unit, phase: "COMMIT" },
        loadout,
        brief: formatPhaseBrief(loadout),
        escalated: false,
      };
    }

    const updated: WorkUnit = {
      ...unit,
      phase: next,
      reviewRounds: previous === "REVIEW" && gate === "FAIL" ? unit.reviewRounds + 1 : unit.reviewRounds,
      testRounds: previous === "VALIDATE" && gate === "FAIL" ? unit.testRounds + 1 : unit.testRounds,
      contractRounds:
        previous === "CONTRACT" && gate === "FAIL" ? unit.contractRounds + 1 : unit.contractRounds,
    };

    if (shouldReturnToPlanFromContract(updated)) {
      return this.dispatch({ ...updated, phase: "PLAN", contractRounds: 0 });
    }

    return this.dispatch(updated);
  }

  /** Suggest phase from agent role when not explicitly set */
  phaseForAgent(role: AgentRole): WorkUnitPhase {
    return AGENT_DEFAULT_PHASE[role] ?? "IMPLEMENT";
  }

  /** Validate role exists in AGENT_ROLES */
  static assertKnownAgent(role: string): asserts role is AgentRole {
    if (!(role in AGENT_ROLES)) {
      throw new Error(`Unknown agent role: ${role}`);
    }
  }

  /** @deprecated use Orchestrator.assertKnownAgent */
  assertKnownAgent(role: string): asserts role is AgentRole {
    Orchestrator.assertKnownAgent(role);
  }
}
