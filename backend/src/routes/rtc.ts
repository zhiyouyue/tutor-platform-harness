import type { FastifyInstance } from "fastify";
import * as rtcService from "../services/rtcService.js";
import { fail, success } from "../utils/response.js";

export default async function rtcRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.post("/rtc/sessions", {
    schema: {
      body: {
        type: "object",
        required: ["calleeId"],
        properties: {
          calleeId: { type: "integer", minimum: 1 },
          orderId: { type: "integer", minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as { calleeId: number; orderId?: number };
      const session = await rtcService.createSession(request.user.userId, body, {
        cache: fastify.cache,
      });
      return success(reply, session, "通话会话已创建", 201);
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "创建失败", e.statusCode || 500);
    }
  });

  fastify.get("/rtc/sessions/incoming", async (request, reply) => {
    try {
      const incoming = await rtcService.listIncomingCalls(request.user.userId);
      return success(reply, { incoming });
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "查询失败", e.statusCode || 500);
    }
  });

  fastify.get("/rtc/sessions", async (request, reply) => {
    try {
      const sessions = await rtcService.listMySessions(
        request.user.userId,
        request.query as { limit?: string; offset?: string },
      );
      return success(reply, { sessions });
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "查询失败", e.statusCode || 500);
    }
  });

  fastify.get("/rtc/sessions/:channelId", async (request, reply) => {
    try {
      const { channelId } = request.params as { channelId: string };
      const session = await rtcService.getSession(channelId, request.user.userId);
      return success(reply, session);
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "查询失败", e.statusCode || 500);
    }
  });

  fastify.post("/rtc/sessions/:channelId/join", async (request, reply) => {
    try {
      const { channelId } = request.params as { channelId: string };
      const joinInfo = await rtcService.joinSession(channelId, request.user.userId, {
        cache: fastify.cache,
      });
      return success(reply, joinInfo, "入会凭证已生成");
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "入会失败", e.statusCode || 500);
    }
  });

  fastify.patch("/rtc/sessions/:channelId/end", async (request, reply) => {
    try {
      const { channelId } = request.params as { channelId: string };
      const session = await rtcService.endSession(channelId, request.user.userId);
      return success(reply, session, "通话已结束");
    } catch (err) {
      const e = err as { message?: string; statusCode?: number };
      return fail(reply, e.message || "结束失败", e.statusCode || 500);
    }
  });
}
