import bcrypt from "bcryptjs";
import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";
import pool from "../../src/db/pool.js";

const testSuffix = Date.now();
const testAccount = `test_expert_${testSuffix}`;
const testPhone = `139${String(testSuffix).slice(-8)}`;

describe("Auth & Expert Profile", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let token = "";
  let expertProfileId = 0;

  beforeAll(async () => {
    app = await buildApp();

    const [admins] = await pool.query<Array<{ id: number }>>(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
    );
    if (admins.length === 0) {
      const hash = bcrypt.hashSync("admin123", 10);
      await pool.query(
        `INSERT INTO users (account, password_hash, role, status) VALUES ('admin', ?, 'admin', 'active')`,
        [hash],
      );
    }
  });

  it("POST /auth/register creates expert", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account: testAccount,
        password: "test123456",
        phone: testPhone,
        realName: "测试专家",
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.role).toBe("expert");
    token = body.data.token;
    expertProfileId = body.data.expertProfile.id;
  });

  it("POST /auth/login returns token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: testAccount, password: "test123456" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.token).toBeTruthy();
  });

  it("GET /auth/me returns profile", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.expertProfile.realName).toBe("测试专家");
  });

  it("PATCH /experts/me/profile updates fields", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/v1/experts/me/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { city: "上海", currentTitle: "产品经理" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.city).toBe("上海");
  });

  it("certification submit and admin approve flow", async () => {
    const submit = await app.inject({
      method: "POST",
      url: "/api/v1/experts/me/certification/submit",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(submit.statusCode).toBe(200);
    expect(submit.json().data.profileStatus).toBe("pending_review");

    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "admin", password: "admin123" },
    });
    expect(adminLogin.statusCode).toBe(200);
    const adminToken = adminLogin.json().data.token;

    const list = await app.inject({
      method: "GET",
      url: "/api/v1/admin/experts/certifications",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.items.some((i: { id: number }) => i.id === expertProfileId)).toBe(true);

    const approve = await app.inject({
      method: "POST",
      url: `/api/v1/admin/experts/${expertProfileId}/certification/approve`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(approve.statusCode).toBe(200);
    expect(approve.json().data.profileStatus).toBe("active");
  });
});
