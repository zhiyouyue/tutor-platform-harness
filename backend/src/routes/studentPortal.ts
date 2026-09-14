import type { FastifyInstance } from "fastify";
import * as projectRepo from "../repositories/projectRepository.js";
import * as studentRepo from "../repositories/studentRepository.js";
import { AppError } from "../errors/AppError.js";
import { success } from "../utils/response.js";
import { formatProject, handleRouteError } from "../utils/routeHelpers.js";

export default async function studentPortalRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.addHook("preHandler", fastify.requireRole("student"));

  fastify.get("/student/projects", async (request, reply) => {
    try {
      const sp = await studentRepo.findStudentByUserId(request.user.userId);
      if (!sp) throw new AppError("学员档案不存在", 404);
      const rows = await projectRepo.listProjects({ studentId: sp.id });
      return success(reply, { items: rows.map(formatProject) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
