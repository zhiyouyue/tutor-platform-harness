import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as capRepo from "../repositories/capabilityRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as expertRepo from "../repositories/expertRepository.js";
import * as expertProfileService from "../services/expertProfileService.js";
import { fail, success } from "../utils/response.js";

function handleError(reply: Parameters<typeof fail>[0], err: unknown) {
  if (err instanceof AppError) return fail(reply, err.message, err.statusCode);
  const e = err as { message?: string };
  return fail(reply, e.message || "服务器错误", 500);
}

export default async function expertRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/experts/me/profile", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const profile = await expertProfileService.getMyProfile(request.user.userId);
      return success(reply, profile);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.patch("/experts/me/profile", {
    preHandler: [fastify.requireRole("expert")],
    schema: {
      body: {
        type: "object",
        properties: {
          realName: { type: "string" },
          city: { type: "string" },
          currentCompany: { type: "string" },
          currentTitle: { type: "string" },
          bio: { type: "string" },
          education: {},
          workExperience: {},
          acceptingProjects: { type: "boolean" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const profile = await expertProfileService.updateMyProfile(
        request.user.userId,
        request.body as Record<string, unknown>,
      );
      return success(reply, profile, "资料已更新");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/experts/me/certification", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const status = await expertProfileService.getCertificationStatus(request.user.userId);
      return success(reply, status);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/experts/me/certification/submit", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const result = await expertProfileService.submitCertification(request.user.userId);
      return success(reply, result, "认证已提交，等待管理员审核");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/experts/me/capabilities", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      return success(reply, await capRepo.getCapabilities(ep.id));
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.put("/experts/me/capabilities", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const body = request.body as capRepo.ExpertCapabilities;
      await capRepo.setCapabilities(ep.id, body);
      return success(reply, await capRepo.getCapabilities(ep.id), "能力已保存");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/experts/me/schedule", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const [slots, blackouts] = await Promise.all([
        scheduleRepo.listSlots(ep.id),
        scheduleRepo.listBlackouts(ep.id),
      ]);
      return success(reply, {
        slots: slots.map((s) => ({
          weekday: s.weekday,
          startTime: String(s.start_time).slice(0, 5),
          endTime: String(s.end_time).slice(0, 5),
        })),
        blackouts: blackouts.map((b) => ({
          id: b.id,
          startAt: b.start_at,
          endAt: b.end_at,
          reason: b.reason,
        })),
      });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.put("/experts/me/schedule", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const body = request.body as { slots: Array<{ weekday: number; startTime: string; endTime: string }> };
      await scheduleRepo.replaceSlots(ep.id, body.slots || []);
      return success(reply, null, "档期已更新");
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.post("/experts/me/schedule/blackouts", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const body = request.body as { startAt: string; endAt: string; reason?: string };
      if (!body.startAt || !body.endAt) throw new AppError("请填写开始与结束时间", 400);
      const row = await scheduleRepo.addBlackout({
        expertId: ep.id,
        startAt: body.startAt,
        endAt: body.endAt,
        reason: body.reason,
      });
      return success(reply, row, "临时不可用已添加", 201);
    } catch (err) {
      return handleError(reply, err);
    }
  });

  fastify.get("/experts/me/appointments", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const ep = await expertRepo.findByUserId(request.user.userId);
      if (!ep) throw new AppError("专家档案不存在", 404);
      const items = await scheduleRepo.listUpcomingForExpert(ep.id, 20);
      return success(reply, {
        items: items.map((a) => ({
          id: a.id,
          projectId: a.project_id,
          projectTitle: a.project_title,
          studentName: a.student_name,
          startAt: a.start_at,
          endAt: a.end_at,
          topic: a.topic,
          status: a.status,
        })),
      });
    } catch (err) {
      return handleError(reply, err);
    }
  });
}
