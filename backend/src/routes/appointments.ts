import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import { joinClassroomForAppointment } from "../services/appointmentClassroomService.js";
import { requireProjectAccess } from "../services/projectAccessService.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function appointmentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.post("/appointments/:id/join-classroom", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const appt = await scheduleRepo.findAppointmentById(appointmentId);
      if (!appt) throw new AppError("课次不存在", 404);
      await requireProjectAccess(appt.project_id, request.user.userId, request.user.role);
      const data = await joinClassroomForAppointment(appointmentId, request.user.userId, {
        cache: fastify.cache,
      });
      return success(reply, data, data.ready ? "可以进入课堂" : data.message);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
