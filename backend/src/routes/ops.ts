import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as studentService from "../services/studentService.js";
import * as appointmentService from "../services/appointmentService.js";
import { requireProjectAccess } from "../services/projectAccessService.js";
import { success } from "../utils/response.js";
import { formatProject, handleRouteError } from "../utils/routeHelpers.js";

export default async function opsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.addHook("preHandler", fastify.requireRole("ops"));

  fastify.get("/ops/students", async (request, reply) => {
    try {
      return success(reply, {
        items: await studentService.listStudentsForHomeroom(request.user.userId),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/students/import", async (request, reply) => {
    try {
      const body = request.body as { items?: Array<Record<string, unknown>> };
      const items = body.items ?? [];
      if (!items.length) throw new AppError("导入列表为空", 400);
      const result = await studentService.importStudents(items as never, request.user.userId);
      return success(reply, result, "批量导入完成", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/students", async (request, reply) => {
    try {
      const body = request.body as Record<string, unknown>;
      const student = await studentService.createStudent(body as never, request.user.userId);
      return success(reply, student, "学员已创建", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/students/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      return success(reply, await studentService.getStudent(parseInt(id, 10)));
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/students/:id/send-login-link", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const link = await studentService.createLoginLink(parseInt(id, 10));
      return success(reply, link, "登录链接已生成");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/experts", async (_req, reply) => {
    try {
      return success(reply, { items: await projectRepo.listExpertsForOps() });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/experts/:id/schedule-slots", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const expertId = parseInt(id, 10);
      const slots = await scheduleRepo.listSlots(expertId);
      const blackouts = await scheduleRepo.listBlackouts(expertId);
      return success(reply, {
        items: slots.map((s) => ({
          weekday: s.weekday,
          startTime: s.start_time,
          endTime: s.end_time,
        })),
        blackouts: blackouts.map((b) => ({
          startAt: b.start_at,
          endAt: b.end_at,
          reason: b.reason,
        })),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/projects", async (request, reply) => {
    try {
      const rows = await projectRepo.listProjects({ opsUserId: request.user.userId });
      return success(reply, { items: rows.map(formatProject) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/projects", async (request, reply) => {
    try {
      const body = request.body as {
        title: string;
        studentId: number;
        expertId?: number;
        totalAmount: number;
        goals?: string[];
        coachingTypes: string[];
      };
      if (!body.title || !body.studentId || !body.coachingTypes?.length) {
        throw new AppError("请填写项目标题、学员和辅导内容", 400);
      }
      const project = await projectRepo.createProject({
        title: body.title,
        studentId: body.studentId,
        expertId: body.expertId,
        opsUserId: request.user.userId,
        totalAmount: body.totalAmount ?? 0,
        goals: body.goals,
        coachingTypes: body.coachingTypes,
      });
      return success(reply, formatProject(project), "项目已创建", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/projects/:id/publish", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, "ops");
      await projectRepo.publishProject(projectId);
      const project = await projectRepo.findProjectById(projectId);
      return success(reply, project ? formatProject(project) : null, "已发布给专家");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/projects/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, "ops");
      const project = await projectRepo.findProjectById(projectId);
      if (!project) throw new AppError("项目不存在", 404);
      return success(reply, formatProject(project));
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/appointments", async (request, reply) => {
    try {
      const items = await scheduleRepo.listAppointmentsForOpsUser(request.user.userId, 100);
      return success(reply, {
        items: items.map((a) => appointmentService.formatAppointment(a)),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/projects/:id/appointments/from-slot", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, "ops");
      const body = request.body as { startAt: string; endAt: string; topic?: string };
      if (!body.startAt || !body.endAt) throw new AppError("请填写开始与结束时间", 400);
      const appt = await appointmentService.createOpsAppointmentFromSlot({
        projectId,
        createdBy: request.user.userId,
        startAt: body.startAt,
        endAt: body.endAt,
        topic: body.topic,
      });
      return success(reply, appt, "课次已按专家档期创建", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/projects/:id/appointments", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, "ops");
      const body = request.body as {
        startAt: string;
        endAt: string;
        topic?: string;
        meetingUrl?: string;
        nodeId?: number;
      };
      if (!body.startAt || !body.endAt) throw new AppError("请填写开始与结束时间", 400);
      const appt = await appointmentService.createOpsAppointment({
        projectId,
        createdBy: request.user.userId,
        startAt: body.startAt,
        endAt: body.endAt,
        topic: body.topic,
        meetingUrl: body.meetingUrl,
        nodeId: body.nodeId,
      });
      return success(reply, appt, "课次已创建", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.patch("/ops/appointments/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const row = await scheduleRepo.findAppointmentById(appointmentId);
      if (!row) throw new AppError("课次不存在", 404);
      await requireProjectAccess(row.project_id, request.user.userId, "ops");
      const body = request.body as { meetingUrl?: string };
      if (!body.meetingUrl) throw new AppError("请提供 meetingUrl", 400);
      const appt = await appointmentService.updateMeetingUrl(appointmentId, body.meetingUrl);
      return success(reply, appt, "会议链接已更新");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/appointments/:id/confirm-completion", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const appointmentId = parseInt(id, 10);
      const row = await scheduleRepo.findAppointmentById(appointmentId);
      if (!row) throw new AppError("课次不存在", 404);
      await requireProjectAccess(row.project_id, request.user.userId, "ops");
      const appt = await appointmentService.opsConfirmAppointmentCompletion(appointmentId);
      return success(reply, appt, "课次完成已确认");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/ops/finance/summary", async (_req, reply) => {
    try {
      return success(reply, await projectRepo.getProjectRevenueSummary());
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/ops/projects/:id/completion/confirm", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, "ops");
      const project = await projectRepo.confirmCompletion(projectId, request.user.userId);
      return success(reply, project ? formatProject(project) : null, "项目已完成并入账");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
