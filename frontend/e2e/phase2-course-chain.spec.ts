/**
 * Phase 2 UI 冒烟 + 截图
 */
import { test, expect } from "@playwright/test";
import { dismissDialogs, opsLogin, opsNav, phase2Snap } from "./phase2-helpers";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  dismissDialogs(page);
});

test("FEAT-P2-OPS 运营登录与首页", async ({ page }) => {
  await opsLogin(page);
  await phase2Snap(page, "FEAT-P2-OPS-dashboard");
});

test("FEAT-P2-STU 学生管理页", async ({ page }) => {
  await opsLogin(page);
  await opsNav(page, "学生");
  await expect(page.getByText("学生").first()).toBeVisible();
  await phase2Snap(page, "FEAT-P2-STU-students");
});

test("FEAT-P2-SCH 课程管理页", async ({ page }) => {
  await opsLogin(page);
  await opsNav(page, "课程");
  await expect(page.getByText("课程").first()).toBeVisible();
  await phase2Snap(page, "FEAT-P2-SCH-schedule");
});

test("FEAT-P2-FIN 收入页", async ({ page }) => {
  await opsLogin(page);
  await opsNav(page, "收入");
  await expect(page.getByText("收入概览")).toBeVisible();
  await phase2Snap(page, "FEAT-P2-FIN-finance");
});
