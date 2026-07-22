import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { WorkUnitPhase } from "./state-machine.js";

/** Handoff artifact — context reset 后新 session 的唯一状态来源 */
export interface HandoffArtifact {
  version: 1;
  workUnitId: string;
  featureId: string;
  phase: WorkUnitPhase;
  sessionId: string;
  createdAt: string;
  reason: "context_reset" | "session_timeout" | "phase_boundary" | "human_pause" | "escalation";
  git: {
    branch: string;
    commit?: string;
    worktreePath?: string;
  };
  progress: {
    completedTaskIds: string[];
    activeTaskId: string;
    blocked: string[];
    percentEstimate?: number;
  };
  sprintContract?: {
    path: string;
    status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED";
    activeCriteriaIds?: string[];
  };
  knownIssues?: Array<{
    id: string;
    severity: "low" | "medium" | "high" | "critical";
    summary: string;
    file?: string;
    line?: number;
  }>;
  nextSteps: string[];
  artifacts: {
    requirements: string;
    design?: string;
    tasks: string;
    tests: string;
    sprintContract?: string;
    execPlan?: string | null;
  };
  contextBudget: {
    estimatedTokensUsed?: number;
    maxTokensBeforeReset?: number;
    stepCount?: number;
    maxStepsBeforeReset?: number;
    resetRecommended: boolean;
  };
  resumeBundle: string[];
}

const ROOT = join(import.meta.dirname, "../../..");

export function handoffPath(featureId: string): string {
  return join(ROOT, "docs/product-specs/features", featureId, "handoff.json");
}

export function parseHandoff(raw: string): HandoffArtifact {
  const data = JSON.parse(raw) as HandoffArtifact;
  validateHandoff(data);
  return data;
}

/** 轻量校验 — 不引入 ajv 依赖，覆盖 Gate 所需字段 */
export function validateHandoff(data: HandoffArtifact): void {
  const required: (keyof HandoffArtifact)[] = [
    "version",
    "workUnitId",
    "featureId",
    "phase",
    "sessionId",
    "createdAt",
    "reason",
    "git",
    "progress",
    "nextSteps",
    "artifacts",
    "contextBudget",
    "resumeBundle",
  ];
  for (const key of required) {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(`Handoff missing required field: ${key}`);
    }
  }
  if (data.version !== 1) throw new Error(`Unsupported handoff version: ${data.version}`);
  if (!data.git.branch) throw new Error("Handoff git.branch is required");
  if (!data.progress.activeTaskId) throw new Error("Handoff progress.activeTaskId is required");
  if (data.nextSteps.length === 0) throw new Error("Handoff nextSteps must not be empty");
  if (data.resumeBundle.length === 0) throw new Error("Handoff resumeBundle must not be empty");
}

export function loadHandoff(featureId: string): HandoffArtifact | null {
  const path = handoffPath(featureId);
  if (!existsSync(path)) return null;
  return parseHandoff(readFileSync(path, "utf-8"));
}

export function verifyHandoffExists(featureId: string): { ok: boolean; error?: string } {
  const path = handoffPath(featureId);
  if (!existsSync(path)) {
    return { ok: false, error: `Missing handoff: ${path}` };
  }
  try {
    parseHandoff(readFileSync(path, "utf-8"));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** 新 session 启动时应加载的文件列表（禁止 replay 完整 chat history） */
export function getResumeBundle(handoff: HandoffArtifact): string[] {
  return handoff.resumeBundle;
}
