/** Work Unit 生命周期阶段 */
export type WorkUnitPhase =
  | "DECOMPOSE"
  | "PLAN"
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
}

/** PEV 状态机 — 有界工作流，非自由对话 */
export const TRANSITIONS: Record<WorkUnitPhase, WorkUnitPhase | "DONE"> = {
  DECOMPOSE: "PLAN",
  PLAN: "IMPLEMENT",
  IMPLEMENT: "VALIDATE",
  VALIDATE: "REVIEW",
  REVIEW: "COMMIT",
  LEARN: "COMMIT",
  COMMIT: "DONE",
};

export const MAX_REVIEW_ROUNDS = Number(process.env.HARNESS_MAX_REVIEW_ROUNDS ?? 5);

export function nextPhase(current: WorkUnitPhase, gate: GateResult): WorkUnitPhase | "DONE" {
  if (current === "VALIDATE" && gate === "FAIL") return "IMPLEMENT";
  if (current === "REVIEW" && gate === "FAIL") return "LEARN";
  if (current === "LEARN") return "IMPLEMENT";
  if (current === "REVIEW" && gate === "PASS") return "COMMIT";
  if (current === "COMMIT") return "DONE";
  return TRANSITIONS[current];
}

export function shouldEscalateToHuman(unit: WorkUnit): boolean {
  return unit.reviewRounds >= MAX_REVIEW_ROUNDS || unit.testRounds >= MAX_REVIEW_ROUNDS;
}
