import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as deliveryRepo from "../repositories/deliveryRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as appointmentService from "../services/appointmentService.js";
import {
  requireExpertProfile,
  requireProjectAccess,
} from "../services/projectAccessService.js";
import * as ossService from "../services/ossService.js";
import * as studentRepo from "../repositories/studentRepository.js";
import { success } from "../utils/response.js";
import { formatProject, handleRouteError } from "../utils/routeHelpers.js";

export default async function projectRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/projects", async (request, reply) => {
    try {
      const { role, userId } = request.user;
      let rows;
      if (role === "expert") {
        const ep = await requireExpertProfile(userId);
        rows = await projectRepo.listProjects({ expertId: ep.id });
      } else if (role === "ops") {
        rows = await projectRepo.listProjects({ opsUserId: userId });
      } else if (role === "student") {
        const sp = await studentRepo.findStudentByUserId(userId);
        if (!sp) throw new AppError("学员档案不存在", 404);
        rows = await projectRepo.listProjects({ studentId: sp.id });
      } else {
        rows = await projectRepo.listProjects({});
      }
      return success(reply, { items: rows.map(formatProject) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/projects/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const project = await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const nodes = await projectRepo.listNodes(project!.id);
      return success(reply, {
        ...formatProject(project!),
        nodes: nodes.map((n) => ({
          id: n.id,
          nodeType: n.node_type,
          label: n.node_label,
          sortOrder: n.sort_order,
          status: n.status,
          completedAt: n.completed_at,
        })),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/accept", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const ep = await requireExpertProfile(request.user.userId);
      const projectId = parseInt(id, 10);
      await projectRepo.acceptProject(projectId, ep.id);
      const project = await projectRepo.findProjectById(projectId);
      return success(reply, project ? formatProject(project) : null, "已接受项目");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/reject", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason?: string };
      const ep = await requireExpertProfile(request.user.userId);
      await projectRepo.rejectProject(parseInt(id, 10), ep.id, reason || "专家拒绝");
      return success(reply, null, "已拒绝项目");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/nodes/:nodeId/complete", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id, nodeId } = request.params as { id: string; nodeId: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, "expert");
      await projectRepo.completeNode(parseInt(id, 10), parseInt(nodeId, 10));
      return success(reply, null, "节点已完成");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/completion/submit", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, "expert");
      await projectRepo.submitCompletion(parseInt(id, 10), request.user.userId);
      return success(reply, null, "已提交完成申请");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  // Messages
  fastify.get("/projects/:id/messages", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { channel } = request.query as { channel?: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const rows = await deliveryRepo.listMessages(parseInt(id, 10), channel);
      return success(reply, {
        items: rows.map((m) => ({
          id: m.id,
          senderUserId: m.sender_user_id,
          senderRole: m.sender_role,
          senderName: m.sender_name,
          channel: m.channel,
          content: m.content,
          createdAt: m.created_at,
        })),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/messages", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { content: string; channel: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const msg = await deliveryRepo.createMessage({
        projectId: parseInt(id, 10),
        senderUserId: request.user.userId,
        senderRole: request.user.role,
        channel: body.channel,
        content: body.content,
      });
      return success(reply, msg, "消息已发送", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  // Files
  fastify.get("/projects/:id/files", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const files = await deliveryRepo.listFiles(parseInt(id, 10));
      return success(reply, { items: files });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/files/upload-url", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      const body = request.body as { fileName: string; mimeType: string };
      await requireProjectAccess(projectId, request.user.userId, request.user.role);
      if (!body.fileName || !body.mimeType) {
        throw new AppError("请提供 fileName 与 mimeType", 400);
      }
      const ossKey = ossService.buildObjectKey(projectId, body.fileName);
      const upload = await ossService.createUploadUrl({ key: ossKey, mimeType: body.mimeType });
      return success(reply, upload);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/files", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      const body = request.body as {
        fileName: string;
        mimeType?: string;
        sizeBytes?: number;
        category?: string;
        ossKey?: string;
      };
      await requireProjectAccess(projectId, request.user.userId, request.user.role);
      const file = await deliveryRepo.createFile({
        projectId,
        uploaderUserId: request.user.userId,
        fileName: body.fileName,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        category: body.category || "other",
        ossBucket: body.ossKey ? (process.env.OSS_BUCKET || "local-dev") : undefined,
        ossKey: body.ossKey,
      });
      return success(reply, file, "文件已登记", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/files/local", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectId = parseInt(id, 10);
      await requireProjectAccess(projectId, request.user.userId, request.user.role);
      const data = await request.file();
      if (!data) throw new AppError("未收到文件", 400);
      const categoryField = data.fields.category;
      const category =
        categoryField && typeof categoryField === "object" && "value" in categoryField
          ? String(categoryField.value)
          : "other";
      const saved = await ossService.saveLocalFile({
        projectId,
        fileName: data.filename,
        stream: data.file,
      });
      const file = await deliveryRepo.createFile({
        projectId,
        uploaderUserId: request.user.userId,
        fileName: data.filename,
        mimeType: data.mimetype,
        sizeBytes: saved.sizeBytes,
        category,
        ossBucket: saved.bucket,
        ossKey: saved.key,
      });
      return success(reply, file, "文件已上传", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  // Coaching records & deliverables
  fastify.get("/projects/:id/coaching-records", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      return success(reply, { items: await deliveryRepo.listCoachingRecords(parseInt(id, 10)) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/coaching-records", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      const ep = await requireExpertProfile(request.user.userId);
      const record = await deliveryRepo.createCoachingRecord({
        projectId: parseInt(id, 10),
        nodeId: body.nodeId as number | undefined,
        expertId: ep.id,
        coachedAt: (body.coachedAt as string) || new Date().toISOString().slice(0, 19).replace("T", " "),
        contentSummary: body.contentSummary as string | undefined,
        studentIssues: body.studentIssues as string | undefined,
        expertAdvice: body.expertAdvice as string | undefined,
      });
      return success(reply, record, "辅导记录已保存", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/projects/:id/deliverables", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      return success(reply, { items: await deliveryRepo.listDeliverables(parseInt(id, 10)) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/deliverables", {
    preHandler: [fastify.requireRole("expert")],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { title: string; description?: string; nodeId?: number };
      const ep = await requireExpertProfile(request.user.userId);
      const item = await deliveryRepo.createDeliverable({
        projectId: parseInt(id, 10),
        nodeId: body.nodeId,
        expertId: ep.id,
        title: body.title,
        description: body.description,
      });
      return success(reply, item, "交付物已提交", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  // Appointments
  fastify.get("/projects/:id/appointments", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const items = await scheduleRepo.listAppointments(parseInt(id, 10));
      return success(reply, { items: items.map((a) => appointmentService.formatAppointment(a)) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/appointments", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { startAt: string; endAt: string; topic?: string; nodeId?: number };
      await requireProjectAccess(parseInt(id, 10), request.user.userId, request.user.role);
      const appt = await scheduleRepo.createAppointment({
        projectId: parseInt(id, 10),
        nodeId: body.nodeId,
        startAt: body.startAt,
        endAt: body.endAt,
        topic: body.topic,
        createdBy: request.user.userId,
      });
      return success(reply, appointmentService.formatAppointment(appt), "预约已创建", 201);
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.post("/projects/:id/appointments/:apptId/expert-complete", async (request, reply) => {
    try {
      const { id, apptId } = request.params as { id: string; apptId: string };
      const projectId = parseInt(id, 10);
      const appointmentId = parseInt(apptId, 10);
      await requireProjectAccess(projectId, request.user.userId, request.user.role);
      if (request.user.role !== "expert") throw new AppError("仅专家可标记课次完成", 403);
      const appt = await appointmentService.expertCompleteAppointment(projectId, appointmentId);
      return success(reply, appt, "课次已标记完成");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
