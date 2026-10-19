import type { FastifyInstance } from "fastify";
import * as notificationService from "../services/notificationService.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/notifications", async (request, reply) => {
    try {
      return success(reply, {
        items: await notificationService.listMyNotifications(request.user.userId),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.patch("/notifications/:id/read", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await notificationService.markNotificationRead(parseInt(id, 10), request.user.userId);
      return success(reply, null, "已标记已读");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
