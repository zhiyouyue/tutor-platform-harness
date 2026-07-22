#!/usr/bin/env node
/**
 * 移除 worktree
 * Usage: node scripts/worktree/remove.mjs TICKET-001
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const ticketId = process.argv[2];

if (!ticketId) {
  console.error("Usage: node scripts/worktree/remove.mjs <TICKET-ID>");
  process.exit(1);
}

const path = join(ROOT, ".worktrees", ticketId);
if (!existsSync(path)) {
  console.error(`Worktree not found: ${path}`);
  process.exit(1);
}

execSync(`git worktree remove "${path}"`, { cwd: ROOT, stdio: "inherit" });
console.log(`Removed worktree: ${ticketId}`);
