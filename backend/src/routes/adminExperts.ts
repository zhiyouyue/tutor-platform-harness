import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as expertProfileService from "../services/expertProfileService.js";
import { fail, success } from "../utils/response.js";

function handleError(reply: Parameters<typeof fail>[0], err: unknown) {
  if (err instanceof AppError) return fail(reply, err.message, err.statusCode);
  const e = err as { message?: string };
  return fail(reply, e.message || "服务器错误", 500);
}

export default async function adminExpertRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.addHook("preHandler", fastify.requireRole("admin"));

  fastify.get("/admin/experts/certifications", async (_request, reply) => {
    try {
      const list = await expertProfileService.listPendingCertifications();
      return success(reply, { items: list });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/admin/experts/:id/certification/approve", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await expertProfileService.approveCertification(
        parseInt(id, 10),
        request.user.userId,
      );
      return success(reply, result, "已通过认证");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/admin/experts/:id/certification/reject", {
    schema: {
      body: {
        type: "object",
        required: ["reason"],
        properties: { reason: { type: "string", minLength: 1 } },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason: string };
      const result = await expertProfileService.rejectCertification(
        parseInt(id, 10),
        request.user.userId,
        reason,
      );
      return success(reply, result, "已拒绝认证");
    } catch (err) {
      return handleError(reply, err);
    }
  });
}
