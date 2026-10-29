import type { FastifyInstance } from "fastify";
import * as projectRepo from "../repositories/projectRepository.js";
import * as studentRepo from "../repositories/studentRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as appointmentService from "../services/appointmentService.js";
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
      const items = await Promise.all(rows.map(async (row) => {
        const nodes = await projectRepo.listNodes(row.id);
        return {
          ...formatProject(row),
          nodes: nodes.map((node) => ({
            id: node.id,
            nodeType: node.node_type,
            label: node.node_label,
            status: node.status,
          })),
        };
      }));
      return success(reply, { items });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/student/appointments", async (request, reply) => {
    try {
      const sp = await studentRepo.findStudentByUserId(request.user.userId);
      if (!sp) throw new AppError("学员档案不存在", 404);
      const rows = await scheduleRepo.listAppointmentsForStudent(sp.id);
      return success(reply, { items: rows.map((a) => appointmentService.formatAppointment(a)) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
