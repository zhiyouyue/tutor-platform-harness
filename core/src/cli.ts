import { runAllGates } from "./gates/quality-gates.js";
import { AGENT_ROLES } from "./agents/roles.js";

const args = process.argv.slice(3);
const dryRun = args.includes("--dry-run");

function runAgentDemo() {
  console.log("=== Harness Agent OS (Phase 0) ===\n");
  console.log("Agent Roles:", Object.keys(AGENT_ROLES).length);
  console.log("Workflow: DECOMPOSE → PLAN → IMPLEMENT → VALIDATE → REVIEW → LEARN → COMMIT\n");

  if (dryRun) {
    console.log("[dry-run] Skipping gate execution");
    return;
  }

  console.log("Running Quality Gates (Orchestrator independent verify)...\n");
  const results = runAllGates();
  let allPass = true;
  for (const { name, result } of results) {
    const icon = result === "PASS" ? "✓" : "✗";
    console.log(`  ${icon} ${name}: ${result}`);
    if (result !== "PASS") allPass = false;
  }

  if (!allPass) {
    console.error("\nGate failed — merge blocked");
    process.exit(1);
  }
  console.log("\nAll gates passed — main stays green");
}

function runEvalDemo() {
  console.log("=== Harness Eval (stub) ===");
  console.log("Track: bugs/PR, review rejection rate, human intervention rate");
  console.log("See docs/QUALITY.md for metrics definition");
}

const cmd = process.argv[2];
if (cmd === "agent") runAgentDemo();
else if (cmd === "eval") runEvalDemo();
else {
  console.log("Usage: npm run agent [-- --dry-run] | npm run eval");
  process.exit(1);
}
