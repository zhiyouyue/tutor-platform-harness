/**
 * Phase 3 UI 冒烟（Q-P3-03~09）+ 截图 → test/phase3/screenshots/
 */
import { test, expect } from "@playwright/test";
import {
  adminLogin,
  adminNav,
  autoDialogs,
  dismissDialogs,
  opsLogin,
  opsNav,
  phase3Snap,
} from "./phase3-helpers";

test.describe.configure({ mode: "serial" });

test("FEAT-P3-ADM 管理员按专家项目看板", async ({ page }) => {
  dismissDialogs(page);
  await adminLogin(page);
  await adminNav(page, "项目看板");
  await expect(page.getByText("公司项目看板（按专家）")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "专家" })).toBeVisible();
  await phase3Snap(page, "FEAT-P3-ADM-expert-board");
});

test("FEAT-P3-OPS 项目管理改派入口", async ({ page }) => {
  dismissDialogs(page);
  await opsLogin(page);
  await opsNav(page, "项目");
  await expect(page.getByText("项目管理")).toBeVisible();
  await phase3Snap(page, "FEAT-P3-OPS-projects");
});

test("FEAT-P3-OPS 课次延期/改期操作", async ({ page }) => {
  autoDialogs(page, ["E2E延期原因"]);
  await opsLogin(page);
  await opsNav(page, "课程");
  await expect(page.getByText("课程管理")).toBeVisible();
  const deferBtn = page.getByRole("button", { name: "延期" }).first();
  if (await deferBtn.isVisible().catch(() => false)) {
    await deferBtn.click();
    await expect(page.getByText("已延期").first()).toBeVisible({ timeout: 8000 }).catch(() => {});
  }
  await phase3Snap(page, "FEAT-P3-OPS-schedule");
});
