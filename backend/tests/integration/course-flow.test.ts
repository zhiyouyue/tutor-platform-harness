import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";

describe("Course session flow (Phase 2)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  let opsToken = "";
  let expertToken = "";
  let studentToken = "";
  let expertProfileId = 0;
  let projectId = 0;
  let appointmentId = 0;

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

  it("setup: expert approved", async () => {
    const account = `course_expert_${suffix}`;
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account,
        password: "test123456",
        phone: `136${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "1")}`,
        realName: "课次专家",
      },
    });
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

  it("ops creates student, project, publishes, student magic login", async () => {
    const stu = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        realName: "课次学员",
        phone: `135${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "2")}`,
        school: "测试大学",
        major: "软件",
        targetRole: "开发",
      },
    });
    expect(stu.statusCode).toBe(201);
    const studentId = stu.json().data.id;

    const link = await app.inject({
      method: "POST",
      url: `/api/v1/ops/students/${studentId}/send-login-link`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    const magic = link.json().data.token;

    const proj = await app.inject({
      method: "POST",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        title: "课次测试项目",
        studentId,
        expertId: expertProfileId,
        totalAmount: 3000,
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

    const magicLogin = await app.inject({
      method: "GET",
      url: `/api/v1/auth/student/magic?token=${magic}`,
    });
    expect(magicLogin.statusCode).toBe(200);
    studentToken = magicLogin.json().data.token;
  });

  it("ops schedules course with meeting link", async () => {
    const start = new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace("T", " ");
    const end = new Date(Date.now() + 90000000).toISOString().slice(0, 19).replace("T", " ");
    const create = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/appointments`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        startAt: start,
        endAt: end,
        topic: "模拟面试",
        meetingUrl: "https://meeting.example.com/course-test",
      },
    });
    expect(create.statusCode).toBe(201);
    appointmentId = create.json().data.id;
    expect(create.json().data.meetingUrl).toContain("meeting.example.com");
  });

  it("student lists appointments", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/student/appointments",
      headers: { authorization: `Bearer ${studentToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.items.some((a: { id: number }) => a.id === appointmentId)).toBe(true);
  });

  it("expert completes course, ops confirms", async () => {
    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/appointments/${appointmentId}/expert-complete`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(complete.statusCode).toBe(200);
    expect(complete.json().data.expertCompletedAt).toBeTruthy();

    const confirm = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${appointmentId}/confirm-completion`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json().data.opsConfirmedAt).toBeTruthy();
    expect(confirm.json().data.status).toBe("completed");

    const income = await app.inject({
      method: "GET",
      url: "/api/v1/income/summary",
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(income.statusCode).toBe(200);
    expect(income.json().data.total).toBe(3000);
  });

  it("ops finance summary", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ops/finance/summary",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.totalAmount).toBeGreaterThan(0);
  });

  it("import students partial success", async () => {
    const phone = `134${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "3")}`;
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students/import",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        items: [
          { realName: "导入A", phone },
          { realName: "导入B", phone },
        ],
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.created.length).toBe(1);
    expect(res.json().data.failed.length).toBe(1);
  });
});
