import { type Page, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(e2eDir, "../../test/phase1/screenshots");

export async function snap(page: Page, name: string) {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export async function gotoHome(page: Page) {
  await page.goto("/");
  await expect(page.getByText("专家交付平台 1.0")).toBeVisible();
}

const ROLE_BUTTON: Record<"专家" | "运营" | "管理员" | "学员", RegExp> = {
  专家: /^专家 Expert/,
  运营: /^运营 Ops/,
  管理员: /^管理员 Admin/,
  学员: /^学员 Student/,
};

export async function pickRole(page: Page, role: "专家" | "运营" | "管理员" | "学员") {
  await gotoHome(page);
  await page.getByRole("button", { name: ROLE_BUTTON[role] }).click();
}

export async function login(page: Page, account: string, password: string) {
  const form = page.locator("form");
  await form.locator("input").first().fill(account);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole("button", { name: /登录|注册并进入/ }).click();
}

export async function registerExpert(
  page: Page,
  data: { account: string; password: string; realName: string; phone: string },
) {
  await page.getByRole("button", { name: "注册" }).click();
  const form = page.locator("form");
  await form.locator("input").nth(0).fill(data.account);
  await form.locator("input").nth(1).fill(data.realName);
  await form.locator("input").nth(2).fill(data.phone);
  await form.locator('input[type="password"]').fill(data.password);
  await form.getByRole("button", { name: "注册并进入" }).click();
}

export async function dismissDialogs(page: Page) {
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
}

export async function expertNav(page: Page, label: string) {
  await page.locator("nav").getByText(label, { exact: true }).click();
}

export async function opsNav(page: Page, label: string) {
  await page.locator("aside").getByText(label, { exact: true }).click();
}
