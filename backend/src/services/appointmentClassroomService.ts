import { AppError } from "../errors/AppError.js";
import * as expertRepo from "../repositories/expertRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as rtcRepo from "../repositories/rtcRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as studentRepo from "../repositories/studentRepository.js";
import * as rtcService from "./rtcService.js";
import { ensurePendingRecordingForSession } from "./rtcRecordingService.js";
import type { CacheAdapter } from "../types/fastify.js";

export async function prepareRtcSessionForAppointment(appointmentId: number) {
  const appt = await scheduleRepo.findAppointmentById(appointmentId);
  if (!appt || appt.status === "cancelled") return null;
  const { expertUserId, studentUserId } = await resolveParticipantUserIds(appt.project_id);
  let session = await rtcRepo.findByAppointmentId(appointmentId);
  if (!session) {
    session = await rtcRepo.createSession({
      creatorId: expertUserId,
      calleeId: studentUserId,
      appointmentId,
    });
  }
  if (session) {
    await ensurePendingRecordingForSession({
      rtcSessionId: session.id,
      appointmentId,
    });
  }
  return session;
}

async function resolveParticipantUserIds(projectId: number) {
  const project = await projectRepo.findProjectById(projectId);
  if (!project) throw new AppError("项目不存在", 404);
  if (!project.expert_id) throw new AppError("项目尚未分配导师", 400);
  const expert = await expertRepo.findById(project.expert_id);
  const student = await studentRepo.findStudentById(project.student_id);
  if (!expert || !student) throw new AppError("导师或学员档案缺失", 404);
  return { expertUserId: expert.user_id, studentUserId: student.user_id, project };
}

export async function joinClassroomForAppointment(
  appointmentId: number,
  userId: number,
  opts: { cache?: CacheAdapter } = {},
) {
  const appt = await scheduleRepo.findAppointmentById(appointmentId);
  if (!appt) throw new AppError("课次不存在", 404);
  if (appt.status === "cancelled") throw new AppError("课次已取消", 400);

  const { expertUserId, studentUserId } = await resolveParticipantUserIds(appt.project_id);
  if (userId !== expertUserId && userId !== studentUserId) {
    throw new AppError("无权进入此课堂", 403);
  }

  let session = await rtcRepo.findByAppointmentId(appointmentId);
  if (!session) {
    session = await prepareRtcSessionForAppointment(appointmentId);
  } else {
    await ensurePendingRecordingForSession({
      rtcSessionId: session.id,
      appointmentId,
    });
  }
  if (!session) throw new AppError("无法创建课堂", 500);

  try {
    const joinInfo = await rtcService.joinSession(session.channel_id, userId, opts);
    return { ready: true, joinInfo, appointmentId };
  } catch (e) {
    const msg = (e as { message?: string }).message || "";
    if (msg.includes("RTC") || msg.includes("未配置") || msg.includes("未启用")) {
      return {
        ready: false,
        message: "在线课堂暂未开通，请联系班主任获取其他上课方式。",
        session: {
          channelId: session.channel_id,
          appointmentId,
        },
      };
    }
    throw e;
  }
}
