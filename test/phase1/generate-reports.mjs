#!/usr/bin/env node
/**
 * 从 Playwright JSON 结果生成 Phase 1 分 Feature 测试报告
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsPath = path.join(__dirname, "results.json");
const screenshotDir = path.join(__dirname, "screenshots");
const backendLogPath = [path.join(__dirname, "backend-runtime.log"), path.join(__dirname, "backend.log")]
  .find((p) => fs.existsSync(p)) ?? path.join(__dirname, "backend.log");

const FEATURE_META = {
  "FEAT-P1-001": { title: "开放注册与登录", ac: "AC-P1-01", role: "专家" },
  "FEAT-P1-002": { title: "资料与能力资产", ac: "AC-P1-01", role: "专家" },
  "FEAT-P1-003": { title: "认证提交", ac: "AC-P1-01", role: "专家" },
  "FEAT-P1-ADM": { title: "管理员认证审核", ac: "AC-P1-02", role: "管理员" },
  "FEAT-P1-OPS": { title: "运营学员/项目/派单", ac: "AC-P1-03", role: "运营" },
  "FEAT-P1-005": { title: "专家接受项目", ac: "AC-P1-04", role: "专家" },
  "FEAT-P1-006": { title: "项目详情与节点", ac: "AC-P1-05", role: "专家" },
  "FEAT-P1-008": { title: "辅导记录与交付物", ac: "AC-P1-07", role: "专家" },
  "FEAT-P1-CMP": { title: "完成确认与入账", ac: "AC-P1-09", role: "专家+运营" },
  "FEAT-P1-010": { title: "收入账本", ac: "AC-P1-09", role: "专家" },
  "AC-P1-02": { title: "运营权限隔离", ac: "AC-P1-02", role: "运营/API" },
};

function readBackendLogTail(maxLines = 80) {
  if (!fs.existsSync(backendLogPath)) {
    return "_（后端日志文件不存在，测试期间请确保 backend 已启动）_";
  }
  const lines = fs.readFileSync(backendLogPath, "utf8").split(/\r?\n/).filter(Boolean);
  return lines.slice(-maxLines).join("\n");
}

function extractFeatureId(testTitle) {
  const m = testTitle.match(/^(FEAT-P1-[A-Z0-9]+|AC-P1-\d+)/);
  return m ? m[1] : testTitle.split(" ")[0];
}

function statusEmoji(status) {
  if (status === "passed") return "✅ PASS";
  if (status === "failed") return "❌ FAIL";
  if (status === "skipped") return "⏭ SKIP";
  return status;
}

function main() {
  if (!fs.existsSync(resultsPath)) {
    console.error("results.json 不存在，请先运行 Playwright 测试");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
  const suites = raw.suites ?? [];
  const tests = [];

  function walk(suite, prefix = "") {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const result = t.results?.[0];
        tests.push({
          title: spec.title,
          featureId: extractFeatureId(spec.title),
          status: result?.status ?? "unknown",
          duration: result?.duration ?? 0,
          error: result?.error?.message ?? "",
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, prefix);
  }
  for (const s of suites) walk(s);

  const backendTail = readBackendLogTail();
  const now = new Date().toISOString();
  const passed = tests.filter((t) => t.status === "passed").length;
  const failed = tests.filter((t) => t.status === "failed").length;

  // 汇总报告
  const summary = `# Phase 1 第一阶段需求测试 — 汇总报告

- **执行时间**: ${now}
- **环境**: 本地 \`http://localhost:5173\` + \`http://localhost:3000\`
- **浏览器**: Google Chrome（Playwright channel: chrome）
- **三角色链路**: 专家 → 管理员（认证）→ 运营（派单/确认）→ 专家（交付/入账）
- **用例总数**: ${tests.length} | **通过**: ${passed} | **失败**: ${failed}

## 验收标准对照

| AC | 描述 | 覆盖 Feature | 结果 |
|----|------|-------------|------|
| AC-P1-01 | 专家注册/资料/认证提交 | FEAT-P1-001~003 | ${tests.filter((t) => ["FEAT-P1-001","FEAT-P1-002","FEAT-P1-003"].some((f) => t.featureId.startsWith(f)) && t.status !== "passed").length ? "部分失败" : "通过"} |
| AC-P1-02 | 管理员审核 + 运营无审核权 | FEAT-P1-ADM, AC-P1-02 | ${tests.some((t) => t.featureId.includes("ADM") && t.status === "failed") || tests.some((t) => t.featureId === "AC-P1-02" && t.status === "failed") ? "失败" : "通过"} |
| AC-P1-03 | 运营建学员/项目/派单 | FEAT-P1-OPS | ${tests.some((t) => t.featureId === "FEAT-P1-OPS" && t.status === "failed") ? "失败" : "通过"} |
| AC-P1-04 | 专家接受项目 | FEAT-P1-005 | ${tests.some((t) => t.featureId === "FEAT-P1-005" && t.status === "failed") ? "失败" : "通过"} |
| AC-P1-05 | 项目详情 | FEAT-P1-006 | ${tests.some((t) => t.featureId === "FEAT-P1-006" && t.status === "failed") ? "失败" : "通过"} |
| AC-P1-07 | 辅导记录与交付 | FEAT-P1-008 | ${tests.some((t) => t.featureId === "FEAT-P1-008" && t.status === "failed") ? "失败" : "通过"} |
| AC-P1-09 | 双确认入账 | FEAT-P1-CMP, FEAT-P1-010 | ${tests.some((t) => t.featureId.startsWith("FEAT-P1-CMP") && t.status === "failed") ? "失败" : "通过"} |

## 用例明细

| Feature | 用例 | 状态 | 耗时(ms) |
|---------|------|------|----------|
${tests.map((t) => `| ${t.featureId} | ${t.title.replace(/^\S+\s/, "")} | ${statusEmoji(t.status)} | ${Math.round(t.duration)} |`).join("\n")}

## 后端日志（末 80 行）

\`\`\`
${backendTail}
\`\`\`

## 截图目录

\`test/phase1/screenshots/\`

## HTML 报告

\`test/phase1/html-report/index.html\`
`;

  fs.writeFileSync(path.join(__dirname, "SUMMARY.md"), summary, "utf8");

  // 分 Feature 报告
  const reportsDir = path.join(__dirname, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const byFeature = new Map();
  for (const t of tests) {
    const id = t.featureId;
    if (!byFeature.has(id)) byFeature.set(id, []);
    byFeature.get(id).push(t);
  }

  for (const [featureId, cases] of byFeature) {
    const meta = FEATURE_META[featureId] ?? { title: featureId, ac: "—", role: "—" };
    const allPass = cases.every((c) => c.status === "passed");
    const shotPrefix = featureId.replace(/[^A-Z0-9-]/gi, "");
    const shots = fs.existsSync(screenshotDir)
      ? fs.readdirSync(screenshotDir).filter((f) => f.startsWith(shotPrefix) || f.startsWith(featureId))
      : [];

    const report = `# ${featureId} 测试报告 — ${meta.title}

- **执行时间**: ${now}
- **关联 AC**: ${meta.ac}
- **测试角色**: ${meta.role}
- **总体结论**: ${allPass ? "✅ **通过**" : "❌ **未通过**"}

## 测试用例

${cases.map((c) => `### ${c.title}

- **结果**: ${statusEmoji(c.status)}
- **耗时**: ${Math.round(c.duration)} ms
${c.error ? `- **失败原因**:\n\`\`\`\n${c.error}\n\`\`\`` : ""}
`).join("\n")}

## 测试步骤（设计）

1. 启动本地后端 \`:3000\` 与前端 \`:5173\`
2. Chrome 浏览器自动化执行用户操作
3. 断言页面可见性与 API 权限
4. 每步全页截图存档

## 截图证据

${shots.length ? shots.map((s) => `- [${s}](../screenshots/${s})`).join("\n") : "_无截图（用例可能未执行到截图步骤）_"}

## 后端日志摘录

\`\`\`
${backendTail}
\`\`\`

## 备注

- 测试数据使用时间戳后缀，避免与历史数据冲突
- 权限用例 AC-P1-02 通过 API 直接验证运营 Token 无法访问 admin 端点
`;

    fs.writeFileSync(path.join(reportsDir, `${featureId}.md`), report, "utf8");
  }

  console.log(`Generated SUMMARY.md and ${byFeature.size} feature reports in test/phase1/reports/`);
}

main();
