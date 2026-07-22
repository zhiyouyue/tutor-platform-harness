import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { GateResult } from "../orchestrator/state-machine.js";

export interface GateCheck {
  name: string;
  command?: string;
  check?: () => boolean;
}

const ROOT = join(import.meta.dirname, "../../..");

export function runGate(check: GateCheck): GateResult {
  try {
    if (check.command) {
      execSync(check.command, { cwd: ROOT, stdio: "pipe" });
    } else if (check.check) {
      if (!check.check()) return "FAIL";
    }
    return "PASS";
  } catch {
    return "FAIL";
  }
}

/** Quality Gates — Orchestrator 独立执行，不信 Agent 自报 */
export const QUALITY_GATES: GateCheck[] = [
  { name: "build", command: "npm run build" },
  { name: "test", command: "npm test" },
  { name: "structure", command: "npm run structure-test -w core" },
];

export function verifySpecExists(featureId: string): GateResult {
  const base = join(ROOT, "docs/product-specs/features", featureId);
  const required = ["requirements.md", "design.md", "tasks.md", "tests.md"];
  const missing = required.filter((f) => !existsSync(join(base, f)));
  if (missing.length > 0) {
    console.error(`Spec gate failed for ${featureId}: missing ${missing.join(", ")}`);
    return "FAIL";
  }
  return "PASS";
}

export function runAllGates(): { name: string; result: GateResult }[] {
  return QUALITY_GATES.map((g) => ({ name: g.name, result: runGate(g) }));
}
