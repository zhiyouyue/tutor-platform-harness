import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as expertProfileService from "../services/expertProfileService.js";
import { fail, success } from "../utils/response.js";

function handleError(reply: Parameters<typeof fail>[0], err: unknown) {
  if (err instanceof AppError) return fail(reply, err.message, err.statusCode);
  const e = err as { message?: string };
  return fail(reply, e.message || "服务器错误", 500);
}

export default async function expertRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/experts/me/profile", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const profile = await expertProfileService.getMyProfile(request.user.userId);
      return success(reply, profile);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.patch("/experts/me/profile", {
    preHandler: [fastify.requireRole("expert")],
    schema: {
      body: {
        type: "object",
        properties: {
          realName: { type: "string" },
          city: { type: "string" },
          currentCompany: { type: "string" },
          currentTitle: { type: "string" },
          bio: { type: "string" },
          education: {},
          workExperience: {},
        },
      },
    },
  }, async (request, reply) => {
    try {
      const profile = await expertProfileService.updateMyProfile(
        request.user.userId,
        request.body as Record<string, unknown>,
      );
      return success(reply, profile, "资料已更新");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/experts/me/certification", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const status = await expertProfileService.getCertificationStatus(request.user.userId);
      return success(reply, status);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/experts/me/certification/submit", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const result = await expertProfileService.submitCertification(request.user.userId);
      return success(reply, result, "认证已提交，等待管理员审核");
    } catch (err) {
      return handleError(reply, err);
    }
  });
}
