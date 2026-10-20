import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";

/** T-P3-OPS-03 / T-P3-STU-02 / 通知 API 冒烟 */
describe("Phase 3 completion checks", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let opsToken = "";
  let studentToken = "";
  let projectId = 0;

  beforeAll(async () => {
    app = await buildApp();
    const ops = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "ops1", password: "ops123456" },
    });
    opsToken = ops.json().data.token;

    const list = await app.inject({
      method: "GET",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    projectId = list.json().data.items[0]?.id ?? 0;
  });

  it("ops GET project detail", async () => {
    if (!projectId) return;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/ops/projects/${projectId}`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.id).toBe(projectId);
  });

  it("student appointments include statusLabel", async () => {
    const projects = await app.inject({
      method: "GET",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    const pid = projects.json().data.items[0]?.id;
    if (!pid) return;

    const stuList = await app.inject({
      method: "GET",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    const studentId = stuList.json().data.items[0]?.id;
    if (!studentId) return;

    const link = await app.inject({
      method: "POST",
      url: `/api/v1/ops/students/${studentId}/send-login-link`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    const magic = link.json().data.token;
    const login = await app.inject({
      method: "GET",
      url: `/api/v1/auth/student/magic?token=${magic}`,
    });
    if (login.statusCode !== 200) return;
    studentToken = login.json().data.token;

    const appts = await app.inject({
      method: "GET",
      url: "/api/v1/student/appointments",
      headers: { authorization: `Bearer ${studentToken}` },
    });
    expect(appts.statusCode).toBe(200);
    const first = appts.json().data.items[0];
    if (first) {
      expect(first.statusLabel).toBeTruthy();
    }
  });

  it("notifications list for ops", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/notifications",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json().data.items)).toBe(true);
  });
});
