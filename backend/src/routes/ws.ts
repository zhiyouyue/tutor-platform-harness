import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import { registerSocket, unregisterSocket } from "../services/realtimeHub.js";

export default async function wsRoutes(fastify: FastifyInstance) {
  await fastify.register(websocket);

  fastify.get("/ws", { websocket: true }, (socket, request) => {
    let userId: number | null = null;

    try {
      const token = (request.query as { token?: string }).token;
      if (!token) {
        socket.close(1008, "missing token");
        return;
      }
      const payload = fastify.jwt.verify<{ userId: number }>(token);
      userId = payload.userId;
      if (!userId) {
        socket.close(1008, "invalid token");
        return;
      }
    } catch {
      socket.close(1008, "unauthorized");
      return;
    }

    registerSocket(userId, socket);
    fastify.log.info({ userId }, "WebSocket connected");
    socket.send(JSON.stringify({ type: "connected", userId }));

    socket.on("close", () => {
      if (userId) unregisterSocket(userId, socket);
      fastify.log.info({ userId }, "WebSocket disconnected");
    });

    socket.on("error", (err: Error) => {
      fastify.log.warn({ userId, err: err.message }, "WebSocket error");
    });
  });
}
