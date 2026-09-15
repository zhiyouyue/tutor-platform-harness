import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const phase1Dir = path.resolve(rootDir, "../test/phase1");

export default defineConfig({
  testDir: "./e2e",
  outputDir: path.join(phase1Dir, "playwright-output"),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: path.join(phase1Dir, "results.json") }],
    ["html", { outputFolder: path.join(phase1Dir, "html-report"), open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "on",
    video: "off",
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
