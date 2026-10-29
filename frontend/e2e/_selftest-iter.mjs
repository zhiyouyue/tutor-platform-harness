import fs from "fs";
import { createRequire } from "module";
import { chromium } from "@playwright/test";

const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const mysql = require("mysql2/promise");

const env = Object.fromEntries(
  fs.readFileSync(new URL("../../backend/.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const labels = ["职业规划", "简历优化", "模拟面试", "面试复盘", "谈薪", "OFFER选择"];
const retired = ["Offer 谈判", "行业洞察", "项目复盘"];

async function login(account, password) {
  const res = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ account, password }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(`login ${account} failed: ${body.message}`);
  return body.data.token;
}

const dict = await fetch("http://localhost:3000/api/v1/dictionaries/coaching-types").then((r) => r.json());
const got = dict.data.items.map((item) => item.label);
if (JSON.stringify(got) !== JSON.stringify(labels)) {
  throw new Error(`dictionary mismatch: ${got.join(",")}`);
}
console.log("dictionary ok");

const opsToken = await login("ops1", "ops123456");
const created = await fetch("http://localhost:3000/api/v1/ops/projects/78/appointments/from-slot", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${opsToken}` },
  body: JSON.stringify({
    startAt: "2026-11-03 09:00:00",
    endAt: "2026-11-03 10:00:00",
    topic: "自测空白时段",
  }),
});
const createdBody = await created.json();
if (created.status !== 201) throw new Error(`outside slot rejected: ${created.status} ${createdBody.message}`);
const appointmentId = createdBody.data.id;
console.log("outside-slot booking ok", appointmentId);

const conn = await mysql.createConnection({
  host: env.MYSQL_HOST || "127.0.0.1",
  port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
});
await conn.query("DELETE FROM rtc_sessions WHERE appointment_id = ?", [appointmentId]);
await conn.query("DELETE FROM project_appointments WHERE id = ? AND topic = '自测空白时段'", [appointmentId]);
const [left] = await conn.query("SELECT id FROM project_appointments WHERE id = ?", [appointmentId]);
if (left.length) throw new Error("cleanup failed");
console.log("cleanup ok");
const [studentRows] = await conn.query(
  "SELECT sp.id AS studentId FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE u.account = 'student1' LIMIT 1",
);
await conn.end();
const studentId = studentRows[0]?.studentId;
if (!studentId) throw new Error("student1 profile missing");

const createdProject = await fetch("http://localhost:3000/api/v1/ops/projects", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${opsToken}` },
  body: JSON.stringify({
    title: "自测辅导内容",
    studentId,
    totalAmount: 1,
    coachingTypes: dict.data.items.map((item) => item.code),
  }),
});
const projectBody = await createdProject.json();
if (createdProject.status !== 201) throw new Error(`project create failed: ${projectBody.message}`);
const projectId = projectBody.data.id;

let browser;
try {
browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function enter(roleTitle, account, password, ready) {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: new RegExp(`^${roleTitle}`) }).click();
  await page.locator("input[name=username]").fill(account);
  await page.locator("input[name=password]").fill(password);
  await page.locator("form").getByRole("button", { name: "登录" }).click();
  await page.getByText(ready).first().waitFor({ timeout: 10000 });
}

await enter("运营", "ops1", "ops123456", "管理后台");
await page.locator(".sidebar-item", { hasText: "项目" }).click();
await page.getByRole("button", { name: "创建项目" }).click();
for (const label of labels) await page.getByRole("button", { name: label }).waitFor();
for (const label of retired) {
  if (await page.getByRole("button", { name: label }).count()) throw new Error(`retired visible: ${label}`);
}
console.log("ops picker ok");
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "创建项目" }).waitFor();
await page.locator("div").filter({ hasText: /^简历优化/ }).getByRole("button", { name: "查看详情" }).click();
await page.getByText("空白处也可以按住拖动排课").waitFor({ timeout: 15000 });
console.log("ops calendar hint ok");

await enter("专家", "expert2", "expert23456", "专家工作台");
await page.getByText("我的能力", { exact: true }).click();
await page.getByText("辅导内容").waitFor();
for (const label of labels) await page.getByText(label).first().waitFor();
console.log("expert capabilities ok");

await enter("管理员", "admin", "admin123", "项目看板");
await page.getByText(`辅导内容：${labels.join("、")}`).waitFor();
console.log("admin catalog ok");

await enter("学员", "student1", "student123456", "学员中心");
await page.getByRole("button", { name: "辅导" }).click();
await page.getByText("辅导内容：").first().waitFor();
const studentText = await page.locator("text=辅导内容：").first().innerText();
if (retired.some((label) => studentText.includes(label))) throw new Error(`student shows retired: ${studentText}`);
console.log("student project ok", studentText);

} finally {
  await browser?.close();
  const cleanup = await mysql.createConnection({
    host: env.MYSQL_HOST || "127.0.0.1",
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
  });
  await cleanup.query("DELETE FROM projects WHERE id = ? AND title = '自测辅导内容'", [projectId]);
  await cleanup.end();
}
console.log("self-test passed");
