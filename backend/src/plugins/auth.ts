import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { config } from "../config/env.js";
import { forbidden, unauthorized } from "../utils/response.js";

export default fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: config.jwt.secret,
    sign: { expiresIn: config.jwt.expiresIn },
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return unauthorized(reply, "登录已失效，请重新登录");
    }
  });

  fastify.decorate("requireRole", (allowedRoles: string | string[]) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return async (request, reply) => {
      if (!request.user) return unauthorized(reply);
      if (!roles.includes(request.user.role)) {
        return forbidden(reply, `此操作需要 ${roles.join(" 或 ")} 权限`);
      }
    };
  });
});
