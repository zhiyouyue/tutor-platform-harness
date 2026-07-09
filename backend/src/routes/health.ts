import type { FastifyPluginAsync } from "fastify";
import { healthResponseSchema } from "../schemas/health.js";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/health",
    {
      schema: {
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );
};

export default healthRoutes;
