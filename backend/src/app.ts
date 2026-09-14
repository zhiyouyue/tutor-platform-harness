import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import redisPlugin from "./plugins/redis.js";
import adminExpertRoutes from "./routes/adminExperts.js";
import authRoutes from "./routes/auth.js";
import expertRoutes from "./routes/experts.js";
import healthRoutes from "./routes/health.js";
import rtcRoutes from "./routes/rtc.js";
import wsRoutes from "./routes/ws.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(redisPlugin);

  await app.register(healthRoutes, { prefix: "/api/v1" });
  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(expertRoutes, { prefix: "/api/v1" });
  await app.register(adminExpertRoutes, { prefix: "/api/v1" });
  await app.register(rtcRoutes, { prefix: "/api" });
  await app.register(wsRoutes, { prefix: "/api" });

  return app;
}
