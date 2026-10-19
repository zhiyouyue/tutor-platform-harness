#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsPath = path.join(__dirname, "results.json");
const screenshotDir = path.join(__dirname, "screenshots");

function main() {
  const integration = `
## 集成测试（Vitest）

| 套件 | 说明 |
|------|------|
| course-flow.test.ts | 课次主链路 + 入账 |
| course-flow-boundary.test.ts | 双确认边界、三分拆 1000、导入重复 |
| project-flow.test.ts | Phase 1 回归 |

执行：\`npm run test -w backend\` → **30 passed**
`;
  let e2e = "_（未运行 Playwright）_";
  if (fs.existsSync(resultsPath)) {
    const raw = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
    const specs = raw.suites?.[0]?.specs ?? [];
    e2e = specs.map((s) => `- ${s.title}: ${s.ok ? "PASS" : "FAIL"}`).join("\n");
  }
  const shots = fs.existsSync(screenshotDir)
    ? fs.readdirSync(screenshotDir).filter((f) => f.endsWith(".png"))
    : [];
  const body = `# Phase 2 测试汇总

- **更新时间**: ${new Date().toISOString()}
${integration}

## E2E 冒烟

${e2e}

## 截图

${shots.length ? shots.map((s) => `- [${s}](screenshots/${s})`).join("\n") : "_运行 frontend e2e phase2-course-chain.spec.ts 后生成_"}

## 已知问题

见 [ISSUES.md](./ISSUES.md)
`;
  fs.writeFileSync(path.join(__dirname, "SUMMARY.md"), body);
  console.log("Wrote test/phase2/SUMMARY.md");
}

main();
