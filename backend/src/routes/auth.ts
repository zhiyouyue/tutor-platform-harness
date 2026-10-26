import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as authService from "../services/authService.js";
import * as classLinkService from "../services/classLinkService.js";
import * as studentAuthService from "../services/studentAuthService.js";
import { fail, success } from "../utils/response.js";

function handleError(reply: Parameters<typeof fail>[0], err: unknown) {
  if (err instanceof AppError) return fail(reply, err.message, err.statusCode);
  const e = err as { message?: string };
  return fail(reply, e.message || "服务器错误", 500);
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/register", {
    schema: {
      body: {
        type: "object",
        required: ["account", "password"],
        properties: {
          account: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
          phone: { type: "string" },
          realName: { type: "string" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as {
        account: string;
        password: string;
        phone?: string;
        realName?: string;
      };
      await authService.registerExpert(body);
      const loginResult = await authService.login(fastify, {
        account: body.account,
        password: body.password,
      });
      return success(reply, loginResult, "注册成功", 201);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/auth/login", {
    schema: {
      body: {
        type: "object",
        required: ["account", "password"],
        properties: {
          account: { type: "string", minLength: 1 },
          password: { type: "string", minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as { account: string; password: string };
      const result = await authService.login(fastify, body);
      return success(reply, result, "登录成功");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/auth/student/magic", async (request, reply) => {
    try {
      const { token } = request.query as { token?: string };
      if (!token) return handleError(reply, new AppError("缺少 token", 400));
      const result = await studentAuthService.verifyMagicLink(fastify, token);
      return success(reply, result, "登录成功");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/auth/student/class", {
    schema: {
      querystring: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string", minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { token } = request.query as { token: string };
      const result = await classLinkService.redeemClassLink(fastify, token);
      return success(reply, result, "登录成功");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/auth/me", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const me = await authService.getMe(request.user.userId);
      return success(reply, me);
    } catch (err) {
      return handleError(reply, err);
    }
  });
}
