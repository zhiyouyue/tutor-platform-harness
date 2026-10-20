/**
 * 蓝系 UI 冒烟：角色入口 + 班主任/管理员关键页截图
 */
import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminLogin, adminNav, dismissDialogs, opsLogin, opsNav } from "./phase3-helpers";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../test/frontend/screenshots/ui-blue");

async function snap(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
}

test.describe.configure({ mode: "serial" });

test("UI-01 角色选择页蓝系", async ({ page }) => {
  dismissDialogs(page);
  await page.goto("/");
  await expect(page.getByText("欢迎登录")).toBeVisible();
  await snap(page, "UI-01-role-gateway");
});

test("UI-02 班主任课程管理", async ({ page }) => {
  dismissDialogs(page);
  await opsLogin(page);
  await opsNav(page, "课程");
  await expect(page.getByText("课程管理")).toBeVisible();
  await snap(page, "UI-02-ops-schedule");
});

test("UI-03 管理员项目看板", async ({ page }) => {
  dismissDialogs(page);
  await adminLogin(page);
  await adminNav(page, "项目看板");
  await expect(page.getByText("公司项目看板（按专家）")).toBeVisible();
  await snap(page, "UI-03-admin-board");
});
