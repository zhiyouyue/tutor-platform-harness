import { type Page, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dismissDialogs, login, pickRole } from "./helpers";

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
export const PHASE3_SCREENSHOT_DIR = path.resolve(e2eDir, "../../test/phase3/screenshots");

export async function phase3Snap(page: Page, name: string) {
  const file = path.join(PHASE3_SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export { dismissDialogs, pickRole, login, opsNav } from "./helpers";
import { opsNav } from "./helpers";

export async function opsLogin(page: Page) {
  await pickRole(page, "运营");
  await login(page, "ops1", "ops123456");
  await expect(page.locator("aside").getByText("首页", { exact: true })).toBeVisible({ timeout: 15000 });
}

export async function adminLogin(page: Page) {
  await pickRole(page, "管理员");
  await login(page, "admin", "admin123");
  await expect(page.locator("aside").getByText("专家认证", { exact: true })).toBeVisible({ timeout: 15000 });
}

/** 自动接受 alert/confirm/prompt（prompt 填默认值） */
export function autoDialogs(page: Page, promptValues: string[] = []) {
  let promptIndex = 0;
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "prompt") {
      const value = promptValues[promptIndex++] ?? "E2E测试";
      await dialog.accept(value);
    } else {
      await dialog.accept();
    }
  });
}

export async function adminNav(page: Page, label: string) {
  await page.locator("aside").getByText(label, { exact: true }).click();
}
