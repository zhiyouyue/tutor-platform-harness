import type { FastifyInstance } from "fastify";
import * as dashboardService from "../services/dashboardService.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/dashboard", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      return success(reply, await dashboardService.getExpertDashboard(request.user.userId));
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/dashboard", {
    preHandler: [fastify.requireRole("ops")],
  }, async (request, reply) => {
    try {
      return success(reply, await dashboardService.getOpsDashboard(request.user.userId));
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
