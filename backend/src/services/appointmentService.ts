import { AppError } from "../errors/AppError.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import { prepareRtcSessionForAppointment } from "./appointmentClassroomService.js";
import { accrueIncomeForConfirmedAppointment } from "./sessionIncomeService.js";
import { assertAppointmentInExpertSchedule } from "./slotScheduleService.js";
import { notifyInApp } from "./notificationService.js";

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
    studentPhone: detail.student_phone ?? undefined,
    completionNotes: row.completion_notes ?? null,
    feeDeductAmount: row.fee_deduct_amount != null ? Number(row.fee_deduct_amount) : null,
    deferReason: row.defer_reason ?? null,
  };
}

export function formatCompletionRecord(row: scheduleRepo.AppointmentDetailRow) {
  const statusLabel =
    row.status === "completed"
      ? "已完成"
      : row.status === "deferred"
        ? "已延期"
        : row.status === "incomplete"
          ? "未完成"
          : row.status === "cancelled"
            ? "已取消"
            : row.expert_completed_at
              ? "待班主任确认"
              : "待上课";
  return {
    studentName: row.student_name ?? "",
    studentPhone: row.student_phone ?? "",
    course: row.topic ?? row.project_title ?? "",
    sessionTime: row.start_at,
    expertName: row.expert_name ?? "",
    status: statusLabel,
    notes: row.completion_notes ?? row.defer_reason ?? "",
  };
}

async function notifyAppointmentStakeholders(
  projectId: number,
  title: string,
  body: string,
) {
  const ids = await projectRepo.getProjectStakeholderUserIds(projectId);
  const targets = [ids.expertUserId, ids.studentUserId, ids.opsUserId].filter(
    (x): x is number => x != null,
  );
  for (const userId of [...new Set(targets)]) {
    await notifyInApp({ userId, title, body, category: "appointment" });
  }
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
  await notifyAppointmentStakeholders(
    params.projectId,
    "新课次已排期",
    `课次「${params.topic ?? "辅导课"}」已安排，请查看日程。`,
  );
  return formatAppointment(row);
}

export async function createOpsAppointmentFromSlot(params: {
  projectId: number;
  createdBy: number;
  startAt: string;
  endAt: string;
  topic?: string;
}) {
  const project = await projectRepo.findProjectById(params.projectId);
  if (!project) throw new AppError("项目不存在", 404);
  if (!project.expert_id) throw new AppError("项目尚未分配导师", 400);
  await assertAppointmentInExpertSchedule(project.expert_id, params.startAt, params.endAt);

  const row = await scheduleRepo.createAppointment({
    projectId: params.projectId,
    createdBy: params.createdBy,
    startAt: params.startAt,
    endAt: params.endAt,
    topic: params.topic,
    status: "confirmed",
  });
  await prepareRtcSessionForAppointment(row.id);
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

export async function expertCompleteAppointment(
  projectId: number,
  appointmentId: number,
  completionNotes?: string,
) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row || row.project_id !== projectId) throw new AppError("课次不存在", 404);
  if (row.status === "cancelled") throw new AppError("课次已取消", 400);
  if (row.ops_confirmed_at) throw new AppError("课次已确认完成", 400);
  await scheduleRepo.updateAppointment(appointmentId, {
    expertCompletedAt: new Date(),
    completionNotes: completionNotes ?? row.completion_notes ?? undefined,
  });
  const stakeholders = await projectRepo.getProjectStakeholderUserIds(projectId);
  if (stakeholders.opsUserId) {
    await notifyInApp({
      userId: stakeholders.opsUserId,
      title: "专家已标记课次完成",
      body: `课次「${row.topic ?? "辅导课"}」待您确认完成。`,
      category: "appointment",
    });
  }
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function rescheduleAppointment(
  appointmentId: number,
  startAt: string,
  endAt: string,
) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  if (row.status === "completed" || row.status === "cancelled") {
    throw new AppError("当前状态不可改期", 400);
  }
  await scheduleRepo.updateAppointment(appointmentId, { startAt, endAt, status: "confirmed" });
  await notifyAppointmentStakeholders(
    row.project_id,
    "课次已改期",
    `课次「${row.topic ?? "辅导课"}」时间已调整。`,
  );
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function deferAppointment(
  appointmentId: number,
  reason: string,
  newStartAt?: string,
  newEndAt?: string,
) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  if (row.status === "completed" || row.status === "cancelled") {
    throw new AppError("当前状态不可延期", 400);
  }
  const patch: Parameters<typeof scheduleRepo.updateAppointment>[1] = {
    status: "deferred",
    deferReason: reason,
  };
  if (newStartAt && newEndAt) {
    patch.startAt = newStartAt;
    patch.endAt = newEndAt;
    patch.status = "confirmed";
  }
  await scheduleRepo.updateAppointment(appointmentId, patch);
  await notifyAppointmentStakeholders(
    row.project_id,
    "课次已延期",
    reason || `课次「${row.topic ?? "辅导课"}」已延期处理。`,
  );
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function markAppointmentIncomplete(
  appointmentId: number,
  reason: string,
  feeDeductAmount?: number,
) {
  const row = await scheduleRepo.findAppointmentById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  if (row.ops_confirmed_at) throw new AppError("课次已确认完成", 400);
  await scheduleRepo.updateAppointment(appointmentId, {
    status: "incomplete",
    deferReason: reason,
    feeDeductAmount: feeDeductAmount ?? null,
    expertCompletedAt: null,
  });
  await notifyAppointmentStakeholders(
    row.project_id,
    "课次未完成",
    reason + (feeDeductAmount ? `（扣费 ¥${feeDeductAmount}）` : ""),
  );
  const updated = await scheduleRepo.findAppointmentById(appointmentId);
  return formatAppointment(updated!);
}

export async function getCompletionRecord(appointmentId: number) {
  const row = await scheduleRepo.findAppointmentDetailById(appointmentId);
  if (!row) throw new AppError("课次不存在", 404);
  return formatCompletionRecord(row);
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
