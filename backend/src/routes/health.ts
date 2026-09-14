import type { FastifyInstance } from "fastify";
import { testConnection } from "../db/pool.js";
import { healthResponseSchema } from "../schemas/health.js";

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", {
    schema: { response: { 200: healthResponseSchema } },
  }, async () => {
    let db = "unknown";
    try {
      await testConnection();
      db = "ok";
    } catch {
      db = "error";
    }

    return {
      status: db === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: { database: db },
    };
  });
}
