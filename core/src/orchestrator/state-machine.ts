/** Work Unit 生命周期阶段 */
export type WorkUnitPhase =
  | "DECOMPOSE"
  | "PLAN"
  | "CONTRACT"
  | "IMPLEMENT"
  | "VALIDATE"
  | "REVIEW"
  | "LEARN"
  | "COMMIT";

export type GateResult = "PASS" | "FAIL" | "SKIP";

export interface WorkUnit {
  id: string;
  featureId: string;
  phase: WorkUnitPhase;
  assignedAgent: string;
  specPath: string;
  worktreePath?: string;
  reviewRounds: number;
  testRounds: number;
  contractRounds: number;
}

/** PEV 状态机 — 有界工作流，非自由对话 */
export const TRANSITIONS: Record<WorkUnitPhase, WorkUnitPhase | "DONE"> = {
  DECOMPOSE: "PLAN",
  PLAN: "CONTRACT",
  CONTRACT: "IMPLEMENT",
  IMPLEMENT: "VALIDATE",
  VALIDATE: "REVIEW",
  REVIEW: "COMMIT",
  LEARN: "COMMIT",
  COMMIT: "DONE",
};

export const MAX_REVIEW_ROUNDS = Number(process.env.HARNESS_MAX_REVIEW_ROUNDS ?? 5);
export const MAX_CONTRACT_ROUNDS = Number(process.env.HARNESS_MAX_CONTRACT_ROUNDS ?? 3);

export function nextPhase(current: WorkUnitPhase, gate: GateResult): WorkUnitPhase | "DONE" {
  if (current === "CONTRACT" && gate === "FAIL") return "CONTRACT";
  if (current === "CONTRACT" && gate === "PASS") return "IMPLEMENT";
  if (current === "VALIDATE" && gate === "FAIL") return "IMPLEMENT";
  if (current === "REVIEW" && gate === "FAIL") return "LEARN";
  if (current === "LEARN") return "IMPLEMENT";
  if (current === "REVIEW" && gate === "PASS") return "COMMIT";
  if (current === "COMMIT") return "DONE";
  return TRANSITIONS[current];
}

/** CONTRACT 多轮协商失败后回到 PLAN 重写 tasks.md */
export function shouldReturnToPlanFromContract(unit: WorkUnit): boolean {
  return unit.phase === "CONTRACT" && unit.contractRounds >= MAX_CONTRACT_ROUNDS;
}

export function shouldEscalateToHuman(unit: WorkUnit): boolean {
  return (
    unit.reviewRounds >= MAX_REVIEW_ROUNDS ||
    unit.testRounds >= MAX_REVIEW_ROUNDS ||
    unit.contractRounds >= MAX_CONTRACT_ROUNDS
  );
}

/** 进入 IMPLEMENT 前必须通过的 phase 门禁 */
export const PHASE_ENTRY_REQUIREMENTS: Partial<Record<WorkUnitPhase, string[]>> = {
  CONTRACT: ["requirements.md", "design.md", "tasks.md", "tests.md"],
  IMPLEMENT: ["sprint-contract.md"],
};
