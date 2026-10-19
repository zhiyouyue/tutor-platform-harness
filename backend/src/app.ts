import multipart from "@fastify/multipart";
import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import redisPlugin from "./plugins/redis.js";
import adminExpertRoutes from "./routes/adminExperts.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import dictionaryRoutes from "./routes/dictionaries.js";
import expertRoutes from "./routes/experts.js";
import healthRoutes from "./routes/health.js";
import incomeRoutes from "./routes/income.js";
import opsRoutes from "./routes/ops.js";
import projectRoutes from "./routes/projects.js";
import rtcRoutes from "./routes/rtc.js";
import studentPortalRoutes from "./routes/studentPortal.js";
import appointmentRoutes from "./routes/appointments.js";
import wsRoutes from "./routes/ws.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(redisPlugin);
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

  await app.register(healthRoutes, { prefix: "/api/v1" });
  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(dictionaryRoutes, { prefix: "/api/v1" });
  await app.register(expertRoutes, { prefix: "/api/v1" });
  await app.register(adminExpertRoutes, { prefix: "/api/v1" });
  await app.register(dashboardRoutes, { prefix: "/api/v1" });
  await app.register(opsRoutes, { prefix: "/api/v1" });
  await app.register(projectRoutes, { prefix: "/api/v1" });
  await app.register(incomeRoutes, { prefix: "/api/v1" });
  await app.register(studentPortalRoutes, { prefix: "/api/v1" });
  await app.register(appointmentRoutes, { prefix: "/api/v1" });
  await app.register(rtcRoutes, { prefix: "/api" });
  await app.register(wsRoutes, { prefix: "/api" });

  return app;
}
