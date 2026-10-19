import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";

describe("Phase 2 boundary cases", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  let opsToken = "";
  let expertToken = "";
  let projectId = 0;
  let apptIds: number[] = [];

  beforeAll(async () => {
    app = await buildApp();
    const ops = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "ops1", password: "ops123456" },
    });
    opsToken = ops.json().data.token;

    const account = `bd_expert_${suffix}`;
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account,
        password: "test123456",
        phone: `132${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "1")}`,
        realName: "边界专家",
      },
    });
    const expertProfileId = reg.json().data.expertProfile.id;
    await app.inject({
      method: "POST",
      url: "/api/v1/experts/me/certification/submit",
      headers: { authorization: `Bearer ${reg.json().data.token}` },
    });
    const admin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "admin", password: "admin123" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/admin/experts/${expertProfileId}/certification/approve`,
      headers: { authorization: `Bearer ${admin.json().data.token}` },
    });
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account, password: "test123456" },
    });
    expertToken = login.json().data.token;

    const stu = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        realName: "边界学员",
        phone: `131${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "2")}`,
      },
    });
    const studentId = stu.json().data.id;
    const proj = await app.inject({
      method: "POST",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        title: "边界拆分项目",
        studentId,
        expertId: expertProfileId,
        totalAmount: 1000,
        coachingTypes: ["mock_interview"],
      },
    });
    projectId = proj.json().data.id;
    await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/publish`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/accept`,
      headers: { authorization: `Bearer ${expertToken}` },
    });

    for (let i = 0; i < 3; i++) {
      const start = new Date(Date.now() + 86400000 * (i + 1)).toISOString().slice(0, 19).replace("T", " ");
      const end = new Date(Date.now() + 86400000 * (i + 1) + 3600000).toISOString().slice(0, 19).replace("T", " ");
      const c = await app.inject({
        method: "POST",
        url: `/api/v1/ops/projects/${projectId}/appointments`,
        headers: { authorization: `Bearer ${opsToken}` },
        payload: { startAt: start, endAt: end, topic: `课${i + 1}` },
      });
      apptIds.push(c.json().data.id);
    }
  });

  it("ops cannot confirm before expert completes", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${apptIds[0]}/confirm-completion`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(res.statusCode).toBe(400);
  });

  it("double ops confirm rejected", async () => {
    await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/appointments/${apptIds[0]}/expert-complete`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    const first = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${apptIds[0]}/confirm-completion`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(first.statusCode).toBe(200);
    const second = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${apptIds[0]}/confirm-completion`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(second.statusCode).toBe(400);
  });

  it("three sessions income sums to project total", async () => {
    for (const id of apptIds.slice(1)) {
      await app.inject({
        method: "POST",
        url: `/api/v1/projects/${projectId}/appointments/${id}/expert-complete`,
        headers: { authorization: `Bearer ${expertToken}` },
      });
      await app.inject({
        method: "POST",
        url: `/api/v1/ops/appointments/${id}/confirm-completion`,
        headers: { authorization: `Bearer ${opsToken}` },
      });
    }
    const income = await app.inject({
      method: "GET",
      url: "/api/v1/income/summary",
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(income.statusCode).toBe(200);
    expect(income.json().data.total).toBe(1000);
  });

  it("join-classroom returns graceful payload when RTC not configured", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/appointments/${apptIds[0]}/join-classroom`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveProperty("ready");
  });

  it("import rejects duplicate phone in batch", async () => {
    const phone = `130${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "4")}`;
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students/import",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        items: [
          { realName: "甲", phone },
          { realName: "乙", phone },
        ],
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.created.length).toBe(1);
    expect(res.json().data.failed.length).toBe(1);
  });
});
