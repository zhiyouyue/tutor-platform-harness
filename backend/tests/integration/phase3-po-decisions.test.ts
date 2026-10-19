import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";

describe("Phase 3 PO decisions (Q-P3-03~09)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  let opsToken = "";
  let expert1Token = "";
  let expert2Token = "";
  let adminToken = "";
  let expert1ProfileId = 0;
  let expert2ProfileId = 0;
  let projectId = 0;
  let appointmentId = 0;
  beforeAll(async () => {
    app = await buildApp();
    const ops = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "ops1", password: "ops123456" },
    });
    opsToken = ops.json().data.token;

    const admin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "admin", password: "admin123" },
    });
    adminToken = admin.json().data.token;
  });

  async function registerExpert(label: string) {
    const account = `p3_${label}_${suffix}`;
    const phoneTail = `${suffix}${label.charCodeAt(0)}`.replace(/\D/g, "").slice(-8).padStart(8, "9");
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account,
        password: "test123456",
        phone: `137${phoneTail}`,
        realName: `P3专家${label}`,
      },
    });
    expect(reg.statusCode).toBe(201);
    const profileId = reg.json().data.expertProfile.id;
    await app.inject({
      method: "POST",
      url: "/api/v1/experts/me/certification/submit",
      headers: { authorization: `Bearer ${reg.json().data.token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/admin/experts/${profileId}/certification/approve`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account, password: "test123456" },
    });
    return { profileId, token: login.json().data.token };
  }

  it("setup project with expert1", async () => {
    const e1 = await registerExpert("a");
    expert1ProfileId = e1.profileId;
    expert1Token = e1.token;
    const e2 = await registerExpert("b");
    expert2ProfileId = e2.profileId;
    expert2Token = e2.token;

    const stu = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        realName: "P3学员",
        phone: `135${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "2")}`,
        school: "测",
        major: "软",
        targetRole: "开",
      },
    });
    const studentId = stu.json().data.id;

    const proj = await app.inject({
      method: "POST",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        title: "P3改派项目",
        studentId,
        expertId: expert1ProfileId,
        totalAmount: 2000,
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
      headers: { authorization: `Bearer ${expert1Token}` },
    });

    const start = new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace("T", " ");
    const end = new Date(Date.now() + 90000000).toISOString().slice(0, 19).replace("T", " ");
    const appt = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/appointments`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { startAt: start, endAt: end, topic: "P3课", meetingUrl: "https://meet.test/p3" },
    });
    appointmentId = appt.json().data.id;
  });

  it("Q-P3-03: ops can reassign expert mid-project", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/ops/projects/${projectId}`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { expertId: expert2ProfileId },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.expertId).toBe(expert2ProfileId);
  });

  it("Q-P3-06: defer and reschedule appointment", async () => {
    const defer = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${appointmentId}/defer`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { reason: "学员临时有事" },
    });
    expect(defer.statusCode).toBe(200);
    expect(defer.json().data.status).toBe("deferred");

    const newStart = new Date(Date.now() + 172800000).toISOString().slice(0, 19).replace("T", " ");
    const newEnd = new Date(Date.now() + 176400000).toISOString().slice(0, 19).replace("T", " ");
    const reschedule = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${appointmentId}/reschedule`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { startAt: newStart, endAt: newEnd },
    });
    expect(reschedule.statusCode).toBe(200);
    expect(reschedule.json().data.startAt).toBeTruthy();
  });

  it("Q-P3-07: expert complete with notes and completion record fields", async () => {
    await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/accept`,
      headers: { authorization: `Bearer ${expert2Token}` },
    });

    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${projectId}/appointments/${appointmentId}/expert-complete`,
      headers: { authorization: `Bearer ${expert2Token}` },
      payload: { completionNotes: "学员表现良好，需加强算法" },
    });
    expect(complete.statusCode).toBe(200);
    expect(complete.json().data.completionNotes).toContain("算法");

    const record = await app.inject({
      method: "GET",
      url: `/api/v1/ops/appointments/${appointmentId}/completion-record`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(record.statusCode).toBe(200);
    const r = record.json().data;
    expect(r.studentName).toBeTruthy();
    expect(r.studentPhone).toBeTruthy();
    expect(r.course).toContain("P3");
    expect(r.expertName).toBeTruthy();
    expect(r.notes).toContain("算法");
  });

  it("Q-P3-06: mark incomplete with fee deduction on new appointment", async () => {
    const start = new Date(Date.now() + 259200000).toISOString().slice(0, 19).replace("T", " ");
    const end = new Date(Date.now() + 262800000).toISOString().slice(0, 19).replace("T", " ");
    const appt2 = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/appointments`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { startAt: start, endAt: end, topic: "扣费课", meetingUrl: "https://meet.test/fee" },
    });
    const id2 = appt2.json().data.id;
    const inc = await app.inject({
      method: "POST",
      url: `/api/v1/ops/appointments/${id2}/mark-incomplete`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: { reason: "学员缺席", feeDeductAmount: 50 },
    });
    expect(inc.statusCode).toBe(200);
    expect(inc.json().data.status).toBe("incomplete");
    expect(inc.json().data.feeDeductAmount).toBe(50);
  });

  it("Q-P3-08: in-app notifications after scheduling", async () => {
    const notifExpert = await app.inject({
      method: "GET",
      url: "/api/v1/notifications",
      headers: { authorization: `Bearer ${expert2Token}` },
    });
    expect(notifExpert.statusCode).toBe(200);
    expect(notifExpert.json().data.items.length).toBeGreaterThan(0);
    expect(notifExpert.json().data.items.some((n: { title: string }) => n.title.includes("课次"))).toBe(
      true,
    );
  });

  it("Q-P3-09: admin dashboard grouped by expert", async () => {
    const dash = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/by-expert",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(dash.statusCode).toBe(200);
    expect(dash.json().data.items.length).toBeGreaterThan(0);
    expect(dash.json().data.items[0]).toHaveProperty("expertName");
    expect(dash.json().data.items[0]).toHaveProperty("projectCount");

    const opsDash = await app.inject({
      method: "GET",
      url: "/api/v1/ops/dashboard",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(opsDash.statusCode).toBe(200);
    expect(opsDash.json().data).toHaveProperty("stats");
    expect(opsDash.json().data).toHaveProperty("recentProjects");
  });

  it("ops cannot access admin by-expert dashboard", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/by-expert",
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(res.statusCode).toBe(403);
  });
});
