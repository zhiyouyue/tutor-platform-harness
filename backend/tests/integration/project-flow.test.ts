import bcrypt from "bcryptjs";
import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";

describe("Project E2E flow", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const suffix = Date.now();
  let opsToken = "";
  let expertToken = "";
  let studentId = 0;
  let expertProfileId = 0;
  let projectId = 0;

  beforeAll(async () => {
    app = await buildApp();
  });

  it("setup: ops login", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "ops1", password: "ops123456" },
    });
    expect(res.statusCode).toBe(200);
    opsToken = res.json().data.token;
  });

  it("setup: create and approve expert", async () => {
    const account = `flow_expert_${suffix}`;
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: { account, password: "test123456", phone: `138${String(suffix).slice(-8)}`, realName: "流程专家" },
    });
    expect(reg.statusCode).toBe(201);
    expertProfileId = reg.json().data.expertProfile.id;
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
  });

  it("ops creates student and project", async () => {
    const stu = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        realName: "流程学员",
        phone: `137${String(suffix).slice(-8)}`,
        school: "测试大学",
        major: "计算机",
        targetRole: "产品",
      },
    });
    expect(stu.statusCode).toBe(201);
    studentId = stu.json().data.id;

    const proj = await app.inject({
      method: "POST",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        title: "流程测试项目",
        studentId,
        expertId: expertProfileId,
        totalAmount: 5000,
        coachingTypes: ["resume_optimization", "mock_interview"],
      },
    });
    expect(proj.statusCode).toBe(201);
    projectId = proj.json().data.id;

    const pub = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/publish`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(pub.statusCode).toBe(200);
  });

  it("expert accepts and completes project", async () => {
    const accept = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/accept`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(accept.statusCode).toBe(200);

    await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/coaching-records`,
      headers: { authorization: `Bearer ${expertToken}` },
      payload: { contentSummary: "首次辅导" },
    });

    await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/deliverables`,
      headers: { authorization: `Bearer ${expertToken}` },
      payload: { title: "优化简历" },
    });

    const submit = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/completion/submit`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(submit.statusCode).toBe(200);
  });

  it("ops confirms completion and income accrued", async () => {
    const confirm = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/completion/confirm`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json().data.status).toBe("completed");

    const income = await app.inject({
      method: "GET",
      url: "/api/v1/income/summary",
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(income.statusCode).toBe(200);
    expect(income.json().data.total).toBeGreaterThan(0);
  });
});
