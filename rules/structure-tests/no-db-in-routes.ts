/**
 * 结构测试：routes 不应直接 import models
 * 重复 mistake ≥3 次后由 Knowledge Curator 升级为 CI block
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const routesDir = join(__dirname, "../../backend/src/routes");

function walkTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) continue;
    if (entry.endsWith(".ts")) files.push(full);
  }
  return files;
}

const violations: string[] = [];

for (const file of walkTsFiles(routesDir)) {
  const content = readFileSync(file, "utf-8");
  if (/from\s+['"].*\/models\//.test(content) || /import\s+.*Model/.test(content)) {
    violations.push(file);
  }
}

if (violations.length > 0) {
  console.error("Structure test failed: routes must not import models directly");
  violations.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log("Structure tests passed");
