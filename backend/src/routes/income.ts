import type { FastifyInstance } from "fastify";
import * as expertRepo from "../repositories/expertRepository.js";
import * as incomeRepo from "../repositories/incomeRepository.js";
import { AppError } from "../errors/AppError.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function incomeRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/income/summary", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const summary = await incomeRepo.getSummary(ep.id);
      return success(reply, {
        total: parseFloat(summary.total),
        pending: parseFloat(summary.pending),
        settled: parseFloat(summary.settled),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/income/transactions", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const lines = await incomeRepo.listByExpert(ep.id);
      return success(reply, {
        items: lines.map((l) => ({
          id: l.id,
          amount: parseFloat(l.amount),
          currency: l.currency,
          status: l.status,
          description: l.description,
          projectTitle: l.project_title,
          accruedAt: l.accrued_at,
          settledAt: l.settled_at,
        })),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
