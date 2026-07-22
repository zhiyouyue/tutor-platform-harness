import { runAllGates } from "./gates/quality-gates.js";
import { AGENT_ROLES, type AgentRole } from "./agents/roles.js";
import { Orchestrator } from "./orchestrator/orchestrator.js";
import type { WorkUnitPhase } from "./orchestrator/state-machine.js";

const args = process.argv.slice(3);
const dryRun = args.includes("--dry-run");

const PHASES = new Set<string>([
  "DECOMPOSE",
  "PLAN",
  "CONTRACT",
  "IMPLEMENT",
  "VALIDATE",
  "REVIEW",
  "LEARN",
  "COMMIT",
]);

function runAgentDemo() {
  console.log("=== Harness Agent OS ===\n");
  console.log("Agent Roles:", Object.keys(AGENT_ROLES).length);
  console.log(
    "Workflow: DECOMPOSE → PLAN → CONTRACT → IMPLEMENT → VALIDATE → REVIEW → LEARN → COMMIT\n",
  );
  console.log("Context reset: handoff.json + resumeBundle (see ADR-004)\n");

  const orchestrator = new Orchestrator();
  const demo = orchestrator.createWorkUnit({
    id: "wu-demo",
    featureId: "demo",
    phase: "PLAN",
    assignedAgent: "architect_agent",
  });
  const { brief } = orchestrator.dispatch(demo);
  console.log("--- Phase loadout (PLAN / demo) ---\n");
  console.log(brief);
  console.log("");

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

function runLoadout() {
  const phaseArg = args.find((a) => !a.startsWith("--"));
  const featureId = args.filter((a) => !a.startsWith("--"))[1] ?? "unknown";
  const agentArg = args.filter((a) => !a.startsWith("--"))[2] ?? "backend_agent";

  if (!phaseArg || !PHASES.has(phaseArg)) {
    console.error("Usage: npm run agent -w core -- loadout <PHASE> [featureId] [agentRole]");
    console.error("Phases:", [...PHASES].join(", "));
    process.exit(1);
  }

  const orchestrator = new Orchestrator();
  if (!(agentArg in AGENT_ROLES)) {
    console.error(`Unknown agent role: ${agentArg}`);
    process.exit(1);
  }
  const agentRole = agentArg as AgentRole;

  const unit = orchestrator.createWorkUnit({
    id: `wu-${featureId}`,
    featureId,
    phase: phaseArg as WorkUnitPhase,
    assignedAgent: agentRole,
  });

  const { brief, loadout } = orchestrator.dispatch(unit);
  console.log(brief);

  if (loadout.missing.length) {
    process.exitCode = 2;
  }
}

function runEvalDemo() {
  console.log("=== Harness Eval (stub) ===");
  console.log("Track: bugs/PR, review rejection rate, human intervention rate");
  console.log("See docs/QUALITY.md for metrics definition");
}

const cmd = process.argv[2];
if (cmd === "agent") runAgentDemo();
else if (cmd === "loadout") runLoadout();
else if (cmd === "eval") runEvalDemo();
else {
  console.log("Usage:");
  console.log("  npm run agent -w core [-- --dry-run]");
  console.log("  npm run agent -w core -- loadout <PHASE> [featureId] [agentRole]");
  console.log("  npm run eval -w core");
  process.exit(1);
}
