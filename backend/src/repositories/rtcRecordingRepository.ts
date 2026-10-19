import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface RtcRecordingRow extends RowDataPacket {
  id: number;
  rtc_session_id: number;
  appointment_id: number | null;
  oss_bucket: string;
  oss_key: string;
  duration_sec: number | null;
  status: string;
  created_at: Date;
  completed_at: Date | null;
}

export async function createPending(params: {
  rtcSessionId: number;
  appointmentId: number | null;
  ossBucket: string;
  ossKey: string;
}): Promise<RtcRecordingRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO rtc_recordings (rtc_session_id, appointment_id, oss_bucket, oss_key, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [params.rtcSessionId, params.appointmentId, params.ossBucket, params.ossKey],
  );
  const [rows] = await pool.query<RtcRecordingRow[]>(
    `SELECT * FROM rtc_recordings WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function completeBySessionChannel(params: {
  rtcSessionId: number;
  ossBucket: string;
  ossKey: string;
  durationSec?: number;
}): Promise<RtcRecordingRow | null> {
  await pool.query(
    `UPDATE rtc_recordings
     SET status = 'ready', oss_bucket = ?, oss_key = ?, duration_sec = ?, completed_at = NOW()
     WHERE rtc_session_id = ? AND status = 'pending'
     ORDER BY id DESC LIMIT 1`,
    [params.ossBucket, params.ossKey, params.durationSec ?? null, params.rtcSessionId],
  );
  const [rows] = await pool.query<RtcRecordingRow[]>(
    `SELECT * FROM rtc_recordings WHERE rtc_session_id = ? ORDER BY id DESC LIMIT 1`,
    [params.rtcSessionId],
  );
  return rows[0] ?? null;
}

export async function upsertFromCallback(params: {
  rtcSessionId: number;
  appointmentId: number | null;
  ossBucket: string;
  ossKey: string;
  durationSec?: number;
  status: "ready" | "failed";
}): Promise<RtcRecordingRow> {
  const [existing] = await pool.query<RtcRecordingRow[]>(
    `SELECT * FROM rtc_recordings WHERE rtc_session_id = ? ORDER BY id DESC LIMIT 1`,
    [params.rtcSessionId],
  );
  if (existing[0]) {
    await pool.query(
      `UPDATE rtc_recordings SET status = ?, oss_bucket = ?, oss_key = ?, duration_sec = ?,
       completed_at = IF(? = 'ready', NOW(), completed_at)
       WHERE id = ?`,
      [
        params.status,
        params.ossBucket,
        params.ossKey,
        params.durationSec ?? null,
        params.status,
        existing[0].id,
      ],
    );
    const [rows] = await pool.query<RtcRecordingRow[]>(
      `SELECT * FROM rtc_recordings WHERE id = ?`,
      [existing[0].id],
    );
    return rows[0]!;
  }
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO rtc_recordings (rtc_session_id, appointment_id, oss_bucket, oss_key, duration_sec, status, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, IF(? = 'ready', NOW(), NULL))`,
    [
      params.rtcSessionId,
      params.appointmentId,
      params.ossBucket,
      params.ossKey,
      params.durationSec ?? null,
      params.status,
      params.status,
    ],
  );
  const [rows] = await pool.query<RtcRecordingRow[]>(
    `SELECT * FROM rtc_recordings WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function listByAppointmentId(appointmentId: number): Promise<RtcRecordingRow[]> {
  const [rows] = await pool.query<RtcRecordingRow[]>(
    `SELECT * FROM rtc_recordings WHERE appointment_id = ? AND status = 'ready' ORDER BY id DESC`,
    [appointmentId],
  );
  return rows;
}
