/**
 * Phase 1 专家/运营/交付链路 E2E
 * 三角色：专家 → 管理员（认证）→ 运营（派单/确认）→ 专家（交付/入账）
 */
import { test, expect } from "@playwright/test";
import {
  snap,
  pickRole,
  login,
  registerExpert,
  dismissDialogs,
  expertNav,
  opsNav,
} from "./helpers";

const suffix = Date.now();
const EXPERT = {
  account: `e2e_expert_${suffix}`,
  password: "test123456",
  realName: `E2E专家_${suffix}`,
  phone: `138${String(suffix).slice(-8)}`,
};
const STUDENT = {
  realName: "E2E测试学员",
  phone: `137${String(suffix).slice(-8)}`,
  school: "测试大学",
  major: "计算机科学",
  targetRole: "产品经理",
};
const PROJECT_TITLE = `E2E交付测试项目_${suffix}`;

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  dismissDialogs(page);
});

test("FEAT-P1-001 专家开放注册与登录", async ({ page }) => {
  await pickRole(page, "专家");
  await registerExpert(page, EXPERT);
  await expect(page.getByText("专家工作台")).toBeVisible({ timeout: 15_000 });
  await snap(page, "FEAT-P1-001-expert-dashboard");
});

test("FEAT-P1-002 专家资料与能力资产", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expect(page.getByText("专家工作台")).toBeVisible();

  await expertNav(page, "我的能力");
  await expect(page.getByText("服务人群")).toBeVisible();
  const firstChip = page.locator("button").filter({ hasText: /简历|面试|行业|产品/ }).first();
  await firstChip.click();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("已保存")).toBeVisible();
  await snap(page, "FEAT-P1-002-capabilities-saved");

  await expertNav(page, "个人中心");
  await expect(page.locator("main, [style*='padding: 24']").getByText("个人中心").first()).toBeVisible();
  await snap(page, "FEAT-P1-002-profile");
});

test("FEAT-P1-003 专家提交认证", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "个人中心");
  await page.getByRole("button", { name: "认证信息" }).click();
  await page.getByRole("button", { name: "提交认证申请" }).click();
  await expect(page.getByText("已提交，等待管理员审核")).toBeVisible();
  await snap(page, "FEAT-P1-003-certification-submitted");
});

test("FEAT-P1-ADM 管理员审核专家认证", async ({ page }) => {
  await pickRole(page, "管理员");
  await login(page, "admin", "admin123");
  await expect(page.locator("main").getByText("专家认证").first()).toBeVisible();
  const expertCard = page.locator("main div").filter({ has: page.getByText(EXPERT.account) }).filter({ has: page.getByRole("button", { name: "通过" }) }).last();
  await expect(expertCard).toBeVisible({ timeout: 10_000 });
  await expertCard.getByRole("button", { name: "通过" }).click();
  await expect(page.locator("main").getByText(EXPERT.account)).toHaveCount(0, { timeout: 10_000 });
  await snap(page, "FEAT-P1-ADM-certification-approved");
});

test("FEAT-P1-OPS 运营创建学员与项目并发布", async ({ page }) => {
  await pickRole(page, "运营");
  await login(page, "ops1", "ops123456");
  await expect(page.getByText("管理后台").first()).toBeVisible();
  await expect(page.locator("main").getByText("活跃项目").first()).toBeVisible();

  await opsNav(page, "学生");
  await page.getByRole("button", { name: "添加", exact: true }).click();
  await page.getByPlaceholder("姓名").fill(STUDENT.realName);
  await page.getByPlaceholder("手机号").fill(STUDENT.phone);
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText(STUDENT.realName).first()).toBeVisible();
  await snap(page, "FEAT-P1-OPS-student-created");

  await opsNav(page, "项目");
  await page.getByRole("button", { name: "创建项目" }).click();
  await page.getByPlaceholder("项目标题").fill(PROJECT_TITLE);
  await page.locator("select").first().selectOption({ label: `${STUDENT.realName} (${STUDENT.phone})` });
  await page.locator("select").nth(1).selectOption({ label: EXPERT.realName });
  await page.getByPlaceholder("总价").fill("5000");
  const coachingBtn = page.locator("button").filter({ hasText: /简历|面试|模拟/ }).first();
  if (await coachingBtn.isVisible()) await coachingBtn.click();
  await page.getByRole("button", { name: "创建", exact: true }).click();
  await expect(page.getByText(PROJECT_TITLE).first()).toBeVisible();
  await snap(page, "FEAT-P1-OPS-project-created");

  const newProjectCard = page.getByText(PROJECT_TITLE, { exact: true }).locator("xpath=ancestor::div[1]");
  await newProjectCard.getByRole("button", { name: "发布给专家" }).click();
  await expect(newProjectCard.getByText(/pending_confirm|in_progress/)).toBeVisible({ timeout: 10_000 });
  await snap(page, "FEAT-P1-OPS-project-published");
});

test("FEAT-P1-005 专家接受项目", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "我的项目");
  await page.getByRole("button", { name: "待确认" }).click();
  await expect(page.getByText(PROJECT_TITLE)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "接受" }).click();
  await page.getByRole("button", { name: "进行中" }).click();
  await expect(page.getByText(PROJECT_TITLE)).toBeVisible();
  await snap(page, "FEAT-P1-005-project-accepted");
});

test("FEAT-P1-006 专家项目详情与节点", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "我的项目");
  await page.getByRole("button", { name: "进行中" }).click();
  await page.getByRole("button", { name: "详情" }).click();
  await expect(page.getByText(PROJECT_TITLE)).toBeVisible();
  await expect(page.getByText("辅导节点")).toBeVisible();
  await snap(page, "FEAT-P1-006-project-detail");
});

test("FEAT-P1-008 辅导记录与交付物", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "我的项目");
  await page.getByRole("button", { name: "进行中" }).click();
  await page.getByRole("button", { name: "详情" }).click();

  await page.getByPlaceholder("辅导摘要").fill("E2E 首次辅导：简历结构优化与 STAR 法则讲解");
  await page.getByRole("button", { name: "保存记录" }).click();
  await page.getByPlaceholder("标题").fill("优化版简历 v1");
  await page.getByRole("button", { name: "提交", exact: true }).click();
  await snap(page, "FEAT-P1-008-records-deliverables");
});

test("FEAT-P1-CMP 专家提交完成", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "我的项目");
  await page.getByRole("button", { name: "进行中" }).click();
  await page.getByRole("button", { name: "详情" }).click();
  await page.getByRole("button", { name: "提交项目完成" }).click();
  await expect(page.getByText(/pending_completion_review|待运营确认/)).toBeVisible({ timeout: 10_000 });
  await snap(page, "FEAT-P1-CMP-expert-submitted");
});

test("FEAT-P1-CMP 运营确认完成并入账", async ({ page }) => {
  await pickRole(page, "运营");
  await login(page, "ops1", "ops123456");
  await opsNav(page, "项目");
  const projectCard = page.getByText(PROJECT_TITLE, { exact: true }).locator("xpath=ancestor::div[1]");
  await expect(projectCard).toBeVisible();
  await projectCard.getByRole("button", { name: "确认完成并入账" }).click();
  await expect(projectCard.getByText("completed")).toBeVisible({ timeout: 10_000 });
  await snap(page, "FEAT-P1-CMP-ops-confirmed");
});

test("FEAT-P1-010 专家收入账本", async ({ page }) => {
  await pickRole(page, "专家");
  await login(page, EXPERT.account, EXPERT.password);
  await expertNav(page, "我的收入");
  await expect(page.locator("main").getByText("我的收入").first()).toBeVisible();
  await expect(page.locator("main").getByText(/¥5,?000/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("main").getByText(/accrued|已入账|pending/)).toBeVisible();
  await snap(page, "FEAT-P1-010-income-ledger");
});

test("AC-P1-02 运营无法访问管理员审核 API", async ({ request }) => {
  const loginRes = await request.post("http://localhost:3000/api/v1/auth/login", {
    data: { account: "ops1", password: "ops123456" },
  });
  expect(loginRes.ok()).toBeTruthy();
  const { data } = await loginRes.json();
  const forbidden = await request.get("http://localhost:3000/api/v1/admin/experts/certifications", {
    headers: { Authorization: `Bearer ${data.token}` },
  });
  expect(forbidden.status()).toBe(403);
});
