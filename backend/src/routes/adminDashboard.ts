import type { FastifyInstance } from "fastify";
import * as projectRepo from "../repositories/projectRepository.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function adminDashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.addHook("preHandler", fastify.requireRole("admin"));

  /** 公司级看板：按专家聚合项目数量（与班主任按项目分类首页不同） */
  fastify.get("/admin/dashboard/by-expert", async (_request, reply) => {
    try {
      const items = await projectRepo.listProjectStatsByExpert();
      return success(reply, { items });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
