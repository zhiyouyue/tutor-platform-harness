import type { WorkUnit, WorkUnitPhase } from "./state-machine.js";
import type { HandoffArtifact } from "./handoff.js";

/** Context reset 策略 — 可通过环境变量覆盖 */
export const CONTEXT_RESET_CONFIG = {
  maxTokensBeforeReset: Number(process.env.HARNESS_MAX_TOKENS ?? 150_000),
  maxStepsBeforeReset: Number(process.env.HARNESS_MAX_STEPS ?? 80),
  /** 这些阶段边界天然适合 reset（artifact 已稳定） */
  resetOnPhaseExit: ["PLAN", "CONTRACT", "VALIDATE", "REVIEW"] as WorkUnitPhase[],
  /** compaction 不足时强制 reset（Sonnet 类 context anxiety 模型） */
  preferResetOverCompaction: process.env.HARNESS_PREFER_RESET === "true",
} as const;

export type ResetTrigger =
  | "token_budget"
  | "step_budget"
  | "phase_boundary"
  | "context_anxiety"
  | "human_request";

export interface ResetDecision {
  shouldReset: boolean;
  trigger?: ResetTrigger;
  reason: string;
}

export interface SessionMetrics {
  estimatedTokensUsed: number;
  stepCount: number;
}

/** 判断当前 session 是否应 context reset */
export function shouldContextReset(
  unit: WorkUnit,
  metrics: SessionMetrics,
  exitingPhase?: WorkUnitPhase,
): ResetDecision {
  if (metrics.estimatedTokensUsed >= CONTEXT_RESET_CONFIG.maxTokensBeforeReset) {
    return {
      shouldReset: true,
      trigger: "token_budget",
      reason: `Token budget exceeded (${metrics.estimatedTokensUsed} >= ${CONTEXT_RESET_CONFIG.maxTokensBeforeReset})`,
    };
  }

  if (metrics.stepCount >= CONTEXT_RESET_CONFIG.maxStepsBeforeReset) {
    return {
      shouldReset: true,
      trigger: "step_budget",
      reason: `Step budget exceeded (${metrics.stepCount} >= ${CONTEXT_RESET_CONFIG.maxStepsBeforeReset})`,
    };
  }

  if (
    exitingPhase &&
    CONTEXT_RESET_CONFIG.resetOnPhaseExit.includes(exitingPhase)
  ) {
    return {
      shouldReset: true,
      trigger: "phase_boundary",
      reason: `Phase boundary after ${exitingPhase}`,
    };
  }

  return { shouldReset: false, reason: "Session within budget" };
}

/** Reset 流程 — Orchestrator 在 reset 前调用 */
export const RESET_PROCEDURE = [
  "1. 停止当前 Agent session（不依赖 chat history 续跑）",
  "2. 写入 handoff.json（模板: docs/templates/handoff.json）",
  "3. 确认 git commit 或 stash 已保存 worktree 状态",
  "4. 新 session 仅加载 resumeBundle 中的文件",
  "5. Pre-Flight: knowledge/ 同类错误 + agent-permissions.json",
  "6. 从 handoff.phase 与 progress.activeTaskId 继续",
] as const;

/** 构建 handoff 的 contextBudget 快照 */
export function buildContextBudget(metrics: SessionMetrics): HandoffArtifact["contextBudget"] {
  const tokenOver = metrics.estimatedTokensUsed >= CONTEXT_RESET_CONFIG.maxTokensBeforeReset;
  const stepOver = metrics.stepCount >= CONTEXT_RESET_CONFIG.maxStepsBeforeReset;
  return {
    estimatedTokensUsed: metrics.estimatedTokensUsed,
    maxTokensBeforeReset: CONTEXT_RESET_CONFIG.maxTokensBeforeReset,
    stepCount: metrics.stepCount,
    maxStepsBeforeReset: CONTEXT_RESET_CONFIG.maxStepsBeforeReset,
    resetRecommended: tokenOver || stepOver,
  };
}

/** 默认 resume bundle — feature 级长任务 */
export function defaultResumeBundle(featureId: string): string[] {
  const base = `docs/product-specs/features/${featureId}`;
  return [
    "AGENTS.md",
    `${base}/handoff.json`,
    `${base}/sprint-contract.md`,
    `${base}/tasks.md`,
    `${base}/tests.md`,
  ];
}
