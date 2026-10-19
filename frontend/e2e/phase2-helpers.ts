import { type Page, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
export const PHASE2_SCREENSHOT_DIR = path.resolve(e2eDir, "../../test/phase2/screenshots");

export async function phase2Snap(page: Page, name: string) {
  const file = path.join(PHASE2_SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export { gotoHome, pickRole, login, dismissDialogs, opsNav } from "./helpers";
import { pickRole, login } from "./helpers";

export async function opsLogin(page: Page) {
  await pickRole(page, "运营");
  await login(page, "ops1", "ops123456");
  await expect(page.locator("aside").getByText("首页", { exact: true })).toBeVisible({ timeout: 15000 });
}
