# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-po-features.spec.ts >> FEAT-P3-ADM 管理员按专家项目看板
- Location: e2e\phase3-po-features.spec.ts:17:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "无法访问此网站" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: 拒绝了我们的连接请求。
    - generic [ref=e10]:
      - paragraph [ref=e11]: 请试试以下办法：
      - list [ref=e12]:
        - listitem [ref=e13]: 检查网络连接
        - listitem [ref=e14]:
          - link "检查代理服务器和防火墙" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "重新加载" [ref=e19] [cursor=pointer]
    - button "详情" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1  | import { type Page, expect } from "@playwright/test";
  2  | import path from "node:path";
  3  | import { fileURLToPath } from "node:url";
  4  | 
  5  | const e2eDir = path.dirname(fileURLToPath(import.meta.url));
  6  | const SCREENSHOT_DIR = path.resolve(e2eDir, "../../test/phase1/screenshots");
  7  | 
  8  | export async function snap(page: Page, name: string) {
  9  |   const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  10 |   await page.screenshot({ path: file, fullPage: true });
  11 |   return file;
  12 | }
  13 | 
  14 | export async function gotoHome(page: Page) {
> 15 |   await page.goto("/");
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  16 |   await expect(page.getByText("欢迎登录")).toBeVisible();
  17 | }
  18 | 
  19 | const ROLE_BUTTON: Record<"专家" | "运营" | "管理员" | "学员", RegExp> = {
  20 |   专家: /^专家 Expert/,
  21 |   运营: /^运营 Ops/,
  22 |   管理员: /^管理员 Admin/,
  23 |   学员: /^学员 Student/,
  24 | };
  25 | 
  26 | export async function pickRole(page: Page, role: "专家" | "运营" | "管理员" | "学员") {
  27 |   await gotoHome(page);
  28 |   await page.getByRole("button", { name: ROLE_BUTTON[role] }).click();
  29 | }
  30 | 
  31 | export async function login(page: Page, account: string, password: string) {
  32 |   const form = page.locator("form");
  33 |   await form.locator("input").first().fill(account);
  34 |   await form.locator('input[type="password"]').fill(password);
  35 |   await form.getByRole("button", { name: /登录|注册并进入/ }).click();
  36 | }
  37 | 
  38 | export async function registerExpert(
  39 |   page: Page,
  40 |   data: { account: string; password: string; realName: string; phone: string },
  41 | ) {
  42 |   await page.getByRole("button", { name: "注册" }).click();
  43 |   const form = page.locator("form");
  44 |   await form.locator("input").nth(0).fill(data.account);
  45 |   await form.locator("input").nth(1).fill(data.realName);
  46 |   await form.locator("input").nth(2).fill(data.phone);
  47 |   await form.locator('input[type="password"]').fill(data.password);
  48 |   await form.getByRole("button", { name: "注册并进入" }).click();
  49 | }
  50 | 
  51 | export async function dismissDialogs(page: Page) {
  52 |   page.on("dialog", async (dialog) => {
  53 |     await dialog.accept();
  54 |   });
  55 | }
  56 | 
  57 | export async function expertNav(page: Page, label: string) {
  58 |   await page.locator("nav").getByText(label, { exact: true }).click();
  59 | }
  60 | 
  61 | export async function opsNav(page: Page, label: string) {
  62 |   await page.locator("aside").getByText(label, { exact: true }).click();
  63 | }
  64 | 
```