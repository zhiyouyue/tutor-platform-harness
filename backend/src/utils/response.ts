import type { FastifyReply } from "fastify";

export function success<T>(
  reply: FastifyReply,
  data: T = null as T,
  message = "操作成功",
  statusCode = 200,
) {
  return reply.status(statusCode).send({ success: true, message, data });
}

export function fail(
  reply: FastifyReply,
  message = "操作失败",
  statusCode = 400,
  errors: unknown = null,
) {
  const body: Record<string, unknown> = { success: false, message, data: null };
  if (errors) body.errors = errors;
  return reply.status(statusCode).send(body);
}

export function unauthorized(reply: FastifyReply, message = "请先登录") {
  return fail(reply, message, 401);
}

export function forbidden(reply: FastifyReply, message = "您没有权限执行此操作") {
  return fail(reply, message, 403);
}
