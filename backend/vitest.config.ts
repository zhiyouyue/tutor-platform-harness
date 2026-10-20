import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reportsDirectory: path.join(rootDir, "../test/phase3/coverage"),
      reporter: ["text", "json-summary", "html"],
      include: [
        "src/domain/**",
        "src/services/notificationService.ts",
        "src/services/projectOpsService.ts",
        "src/services/appointmentService.ts",
      ],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
      },
    },
  },
});
