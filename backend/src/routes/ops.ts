import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as studentService from "../services/studentService.js";
import { requireProjectAccess } from "../services/projectAccessService.js";
import { success } from "../utils/response.js";
import { formatProject, handleRouteError } from "../utils/routeHelpers.js";

export default async function opsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.addHook("preHandler", fastify.requireRole("ops"));

  fastify.get("/ops/students", async (_req, reply) => {
    try {
      return success(reply, { items: await studentService.listStudents() });
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

  fastify.get("/ops/projects", async (_req, reply) => {
    try {
      const rows = await projectRepo.listProjects({});
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
