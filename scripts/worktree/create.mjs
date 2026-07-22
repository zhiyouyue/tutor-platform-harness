#!/usr/bin/env node
/**
 * 为 Work Unit 创建隔离 git worktree
 * Usage: node scripts/worktree/create.mjs TICKET-001 [base-branch]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const WORKTREES_DIR = join(ROOT, ".worktrees");

const ticketId = process.argv[2];
const baseBranch = process.argv[3] ?? "main";

if (!ticketId) {
  console.error("Usage: node scripts/worktree/create.mjs <TICKET-ID> [base-branch]");
  process.exit(1);
}

const branch = `worktree/${ticketId}`;
const path = join(WORKTREES_DIR, ticketId);

if (!existsSync(WORKTREES_DIR)) mkdirSync(WORKTREES_DIR, { recursive: true });

if (existsSync(path)) {
  console.log(`Worktree already exists: ${path}`);
  process.exit(0);
}

execSync(`git worktree add -b ${branch} "${path}" ${baseBranch}`, {
  cwd: ROOT,
  stdio: "inherit",
});

console.log(`\nWorktree ready: ${path}`);
console.log(`Branch: ${branch}`);
console.log(`Agent scope: isolated copy — merge only after all Gates pass`);
