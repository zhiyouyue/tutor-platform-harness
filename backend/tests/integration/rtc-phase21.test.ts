import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { config } from "../../src/config/env.js";

describe("Phase 2.1 RTC slot + recording", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  let opsToken = "";
  let expertToken = "";
  let expertProfileId = 0;
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

    const account = `rtc21_expert_${suffix}`;
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account,
        password: "test123456",
        phone: `131${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "3")}`,
        realName: "RTC专家",
      },
    });
    expertProfileId = reg.json().data.expertProfile.id;
    expertToken = reg.json().data.token;
    await app.inject({
      method: "POST",
      url: "/api/v1/experts/me/certification/submit",
      headers: { authorization: `Bearer ${expertToken}` },
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

    await app.inject({
      method: "PUT",
      url: "/api/v1/experts/me/schedule",
      headers: { authorization: `Bearer ${expertToken}` },
      payload: {
        slots: [{ weekday: 1, startTime: "19:00:00", endTime: "21:00:00" }],
      },
    });
  });

  it("creates project and appointment from valid slot", async () => {
    const stu = await app.inject({
      method: "POST",
      url: "/api/v1/ops/students",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        realName: "RTC学员",
        phone: `130${String(suffix).replace(/\D/g, "").slice(-8).padStart(8, "4")}`,
      },
    });
    const studentId = stu.json().data.id;
    const proj = await app.inject({
      method: "POST",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        title: `RTC项目_${suffix}`,
        studentId,
        expertId: expertProfileId,
        totalAmount: 3000,
        coachingTypes: ["mock_interview"],
      },
    });
    expect(proj.statusCode).toBe(201);
    projectId = proj.json().data.id;
    await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/publish`,
      headers: { authorization: `Bearer ${opsToken}` },
    });

    const nextMon = new Date();
    const day = nextMon.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    nextMon.setDate(nextMon.getDate() + diff);
    const dateStr = nextMon.toISOString().slice(0, 10);

    const appt = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/appointments/from-slot`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        startAt: `${dateStr} 19:00:00`,
        endAt: `${dateStr} 20:00:00`,
        topic: "RTC课",
      },
    });
    expect(appt.statusCode).toBe(201);
    appointmentId = appt.json().data.id;
  });

  it("accepts appointment outside the expert open slot", async () => {
    const nextMon = new Date();
    const day = nextMon.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    nextMon.setDate(nextMon.getDate() + diff);
    const dateStr = nextMon.toISOString().slice(0, 10);
    const bad = await app.inject({
      method: "POST",
      url: `/api/v1/ops/projects/${projectId}/appointments/from-slot`,
      headers: { authorization: `Bearer ${opsToken}` },
      payload: {
        startAt: `${dateStr} 09:00:00`,
        endAt: `${dateStr} 10:00:00`,
      },
    });
    expect(bad.statusCode).toBe(201);
  });

  it("join-classroom prepares session", async () => {
    const join = await app.inject({
      method: "POST",
      url: `/api/v1/appointments/${appointmentId}/join-classroom`,
      headers: { authorization: `Bearer ${expertToken}` },
    });
    expect(join.statusCode).toBe(200);
    if (join.json().data.ready) {
      expect(join.json().data.joinInfo.channel).toBeTruthy();
    }
  });

  it("recording callback registers OSS metadata", async () => {
    await app.inject({
      method: "POST",
      url: `/api/v1/appointments/${appointmentId}/join-classroom`,
      headers: { authorization: `Bearer ${expertToken}` },
    });

    const cb = await app.inject({
      method: "POST",
      url: "/api/v1/internal/rtc/recording-callback",
      headers: {
        "x-rtc-callback-secret": config.rtc.recordingCallbackSecret,
      },
      payload: {
        appointmentId,
        ossKey: `recordings/test/${appointmentId}.mp4`,
        durationSec: 3600,
        status: "ready",
      },
    });
    expect(cb.statusCode).toBe(200);

    const list = await app.inject({
      method: "GET",
      url: `/api/v1/appointments/${appointmentId}/recordings`,
      headers: { authorization: `Bearer ${opsToken}` },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.items.length).toBeGreaterThanOrEqual(1);
    expect(list.json().data.items[0].ossKey).toContain(String(appointmentId));
  });
});
