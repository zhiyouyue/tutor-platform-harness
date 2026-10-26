import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import { joinClassroomForAppointment } from "../services/appointmentClassroomService.js";
import * as rtcRecordingService from "../services/rtcRecordingService.js";
import * as appointmentService from "../services/appointmentService.js";
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

  fastify.get("/appointments/:id/completion-record", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const appt = await scheduleRepo.findAppointmentById(appointmentId);
      if (!appt) throw new AppError("课次不存在", 404);
      await requireProjectAccess(appt.project_id, request.user.userId, request.user.role);
      return success(reply, await appointmentService.getCompletionRecord(appointmentId));
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/appointments/:id/recordings/segments", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const appt = await scheduleRepo.findAppointmentById(appointmentId);
      if (!appt) throw new AppError("课次不存在", 404);
      await requireProjectAccess(appt.project_id, request.user.userId, request.user.role);
      const data = await request.file();
      if (!data) throw new AppError("未收到录像", 400);
      const body = await data.toBuffer();
      const saved = await rtcRecordingService.saveRecordingSegment({
        appointmentId,
        userId: request.user.userId,
        mimeType: data.mimetype || "video/webm",
        body,
      });
      return success(reply, saved, "录像片段已保存", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/appointments/:id/recordings", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const appt = await scheduleRepo.findAppointmentById(appointmentId);
      if (!appt) throw new AppError("课次不存在", 404);
      await requireProjectAccess(appt.project_id, request.user.userId, request.user.role);
      const items = await rtcRecordingService.listRecordingsForAppointment(appointmentId);
      return success(reply, { items });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
