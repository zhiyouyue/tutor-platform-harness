import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import { parseClassJoinToken } from "./classLink.js";

export async function redeemClassLink(app: FastifyInstance, token: string) {
  const appointmentId = parseClassJoinToken(token);
  const appt = await scheduleRepo.findAppointmentById(appointmentId);
  if (!appt) throw new AppError("课次不存在", 404);
  if (appt.status === "cancelled") throw new AppError("课次已取消", 400);

  const ids = await projectRepo.getProjectStakeholderUserIds(appt.project_id);
  if (!ids.studentUserId) throw new AppError("课次未关联学员", 400);

  const user = await userRepo.findById(ids.studentUserId);
  if (!user || user.role !== "student" || user.status !== "active") {
    throw new AppError("学员账号不可用", 400);
  }

  const jwt = app.jwt.sign({
    userId: user.id,
    role: user.role,
    account: user.account ?? undefined,
  });

  return {
    token: jwt,
    appointmentId,
    user: {
      id: user.id,
      account: user.account,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
}
