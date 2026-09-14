import { describe, it, expect } from "vitest";
import { buildApp } from "../../src/app.js";

describe("GET /api/v1/health", () => {
  it("returns health payload", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(["ok", "degraded"]).toContain(body.status);
    expect(body.timestamp).toBeDefined();
    expect(body.services).toBeDefined();
  });
});
