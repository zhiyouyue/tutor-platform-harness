import bcrypt from "bcryptjs";
import { describe, it, expect, beforeAll } from "vitest";
import { buildApp } from "../../src/app.js";
import * as userRepo from "../../src/repositories/userRepository.js";

describe("RBAC: ops project scope", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let ops1Token = "";
  let ops2Token = "";
  let foreignProjectId = 0;

  beforeAll(async () => {
    app = await buildApp();
    const ops1 = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account: "ops1", password: "ops123456" },
    });
    ops1Token = ops1.json().data.token;

    const suffix = Date.now();
    const account = `ops2_rbac_${suffix}`;
    await userRepo.createUser({
      account,
      phone: `1388${String(suffix).slice(-7)}`,
      passwordHash: bcrypt.hashSync("ops123456", 10),
      role: "ops",
    });
    const ops2Login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { account, password: "ops123456" },
    });
    ops2Token = ops2Login.json().data.token;

    const list = await app.inject({
      method: "GET",
      url: "/api/v1/ops/projects",
      headers: { authorization: `Bearer ${ops1Token}` },
    });
    foreignProjectId = list.json().data.items[0]?.id ?? 0;
  });

  it("ops2 cannot GET ops1 project detail", async () => {
    expect(foreignProjectId).toBeGreaterThan(0);
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/ops/projects/${foreignProjectId}`,
      headers: { authorization: `Bearer ${ops2Token}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("expert cannot call ops dashboard", async () => {
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        account: `rbac_expert_${Date.now()}`,
        password: "test123456",
        phone: `136${String(Date.now()).slice(-8)}`,
        realName: "RBAC专家",
      },
    });
    const token = reg.json().data.token;
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ops/dashboard",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(403);
  });
});
