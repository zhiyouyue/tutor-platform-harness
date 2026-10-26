import { AppError } from "../errors/AppError.js";
import { config } from "../config/env.js";
import * as ossService from "./ossService.js";
import * as deliveryRepo from "../repositories/deliveryRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as rtcRepo from "../repositories/rtcRepository.js";
import * as rtcRecordingRepo from "../repositories/rtcRecordingRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";

export function formatRecording(row: rtcRecordingRepo.RtcRecordingRow) {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    ossBucket: row.oss_bucket,
    ossKey: row.oss_key,
    durationSec: row.duration_sec,
    status: row.status,
    completedAt: row.completed_at,
  };
}

export async function ensurePendingRecordingForSession(params: {
  rtcSessionId: number;
  appointmentId: number;
}) {
  const bucket = config.oss.bucket || "local-dev";
  const key = `recordings/appointments/${params.appointmentId}/${params.rtcSessionId}.mp4`;
  try {
    await rtcRecordingRepo.createPending({
      rtcSessionId: params.rtcSessionId,
      appointmentId: params.appointmentId,
      ossBucket: bucket,
      ossKey: key,
    });
  } catch {
    // 表未迁移或重复创建时忽略
  }
}

export async function handleRecordingCallback(body: {
  channelId?: string;
  rtcSessionId?: number;
  appointmentId?: number;
  ossKey: string;
  ossBucket?: string;
  durationSec?: number;
  status?: "ready" | "failed";
}) {
  if (!body.ossKey) throw new AppError("缺少 ossKey", 400);

  let session = null as Awaited<ReturnType<typeof rtcRepo.findByChannelId>> | null;
  if (body.channelId) {
    session = await rtcRepo.findByChannelId(body.channelId);
  } else if (body.rtcSessionId) {
    session = await rtcRepo.findById(body.rtcSessionId);
  } else if (body.appointmentId) {
    session = await rtcRepo.findByAppointmentId(body.appointmentId);
  }
  if (!session) throw new AppError("RTC 会话不存在", 404);

  const status = body.status === "failed" ? "failed" : "ready";
  const bucket = body.ossBucket || config.oss.bucket || "local-dev";
  const row = await rtcRecordingRepo.upsertFromCallback({
    rtcSessionId: session.id,
    appointmentId: session.appointment_id,
    ossBucket: bucket,
    ossKey: body.ossKey,
    durationSec: body.durationSec,
    status,
  });

  if (status === "ready" && session.appointment_id) {
    const appt = await scheduleRepo.findAppointmentById(session.appointment_id);
    if (appt) {
      const project = await projectRepo.findProjectById(appt.project_id);
      if (project) {
        try {
          await deliveryRepo.createFile({
            projectId: appt.project_id,
            uploaderUserId: project.ops_user_id,
            fileName: `课次录制-${session.appointment_id}.mp4`,
            mimeType: "video/mp4",
            category: "recording",
            ossBucket: bucket,
            ossKey: body.ossKey,
          });
        } catch {
          // 重复写入 project_files 时忽略
        }
      }
    }
  }

  return formatRecording(row);
}

export async function saveRecordingSegment(params: {
  appointmentId: number;
  userId: number;
  mimeType: string;
  body: Buffer;
}) {
  if (params.body.length === 0) throw new AppError("录像片段是空的", 400);
  const appt = await scheduleRepo.findAppointmentById(params.appointmentId);
  if (!appt) throw new AppError("课次不存在", 404);
  const session = await rtcRepo.findByAppointmentId(params.appointmentId);
  if (!session) throw new AppError("课堂尚未建立", 400);

  const key = `recordings/appointments/${params.appointmentId}/${Date.now()}-u${params.userId}.webm`;
  const saved = await ossService.putBytes({
    key,
    body: params.body,
    mimeType: params.mimeType || "video/webm",
  });
  const row = await rtcRecordingRepo.insertReady({
    rtcSessionId: session.id,
    appointmentId: params.appointmentId,
    ossBucket: saved.bucket,
    ossKey: saved.key,
  });
  try {
    await deliveryRepo.createFile({
      projectId: appt.project_id,
      uploaderUserId: params.userId,
      fileName: `课次录像-${params.appointmentId}-${params.userId}.webm`,
      mimeType: params.mimeType || "video/webm",
      sizeBytes: params.body.length,
      category: "recording",
      ossBucket: saved.bucket,
      ossKey: saved.key,
    });
  } catch {
    // 文件登记失败时，OSS 对象和 rtc_recordings 仍然保留
  }
  return formatRecording(row);
}

export async function listRecordingsForAppointment(appointmentId: number) {
  const rows = await rtcRecordingRepo.listByAppointmentId(appointmentId);
  return rows.map(formatRecording);
}

export function assertCallbackSecret(header: string | undefined): void {
  const expected = config.rtc.recordingCallbackSecret;
  if (!header || header !== expected) {
    throw new AppError("回调鉴权失败", 401);
  }
}
