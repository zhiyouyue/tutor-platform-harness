import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

function signAppointment(appointmentId: number): string {
  return createHmac("sha256", config.jwt.secret)
    .update(`class:${appointmentId}`)
    .digest("base64url");
}

export function classJoinToken(appointmentId: number): string {
  return `${appointmentId}.${signAppointment(appointmentId)}`;
}

export function parseClassJoinToken(token: string): number {
  const dot = token.indexOf(".");
  if (dot <= 0) throw new AppError("上课链接无效", 400);
  const id = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isInteger(id) || id <= 0 || !sig) throw new AppError("上课链接无效", 400);
  const expected = signAppointment(id);
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    throw new AppError("上课链接无效", 400);
  }
  return id;
}

export function classPathForAppointment(appointmentId: number, status: string): string | null {
  if (status === "cancelled") return null;
  return `/?class=${classJoinToken(appointmentId)}`;
}

export function attachClassPath<T extends { id: number; status: string }>(item: T) {
  return { ...item, classPath: classPathForAppointment(item.id, item.status) };
}
