import { AppError } from "../errors/AppError.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import { accrueIncomeForConfirmedAppointment } from "./sessionIncomeService.js";

export function formatAppointment(row: scheduleRepo.AppointmentRow | scheduleRepo.AppointmentDetailRow) {
  const detail = row as scheduleRepo.AppointmentDetailRow;
  return {
    id: row.id,
    projectId: row.project_id,
    nodeId: row.node_id,
    startAt: row.start_at,
    endAt: row.end_at,
    topic: row.topic,
    meetingUrl: row.meeting_url ?? null,
    status: row.status,
    expertCompletedAt: row.expert_completed_at ?? null,
    opsConfirmedAt: row.ops_confirmed_at ?? null,
    projectTitle: detail.project_title ?? undefined,
    studentName: detail.student_name ?? undefined,
    expertName: detail.expert_name ?? undefined,
  };
}

export async function createOpsAppointment(params: {
  projectId: number;
  createdBy: number;
  startAt: string;
  endAt: string;
  topic?: string;
  meetingUrl?: string;
  nodeId?: number;
}) {
  const status = params.meetingUrl ? "confirmed" : "scheduled";
  const row = await scheduleRepo.createAppointment({
    ...params,
    meetingUrl: params.meetingUrl,
    status,
  });
  return formatAppointment(row);
}

export async function updateMeetingUrl(appointmentId: number, meetingUrl: string) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  await scheduleRepo.updateAppointment(appointmentId, {
    meetingUrl,
    status: row.status === "scheduled" ? "confirmed" : row.status,
  });
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function expertCompleteAppointment(projectId: number, appointmentId: number) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row || row.project_id !== projectId) throw new AppError("课次不存在", 404);
  if (row.status === "cancelled") throw new AppError("课次已取消", 400);
  if (row.ops_confirmed_at) throw new AppError("课次已确认完成", 400);
  await scheduleRepo.updateAppointment(appointmentId, {
    expertCompletedAt: new Date(),
  });
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function opsConfirmAppointmentCompletion(appointmentId: number) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  if (!row.expert_completed_at) throw new AppError("专家尚未标记课次完成", 400);
  if (row.ops_confirmed_at) throw new AppError("课次已确认", 400);
  await scheduleRepo.updateAppointment(appointmentId, {
    opsConfirmedAt: new Date(),
    status: "completed",
  });
  await accrueIncomeForConfirmedAppointment(appointmentId);
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}
