import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface SlotRow extends RowDataPacket {
  id: number;
  expert_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface BlackoutRow extends RowDataPacket {
  id: number;
  expert_id: number;
  start_at: Date;
  end_at: Date;
  reason: string | null;
}

export interface AppointmentRow extends RowDataPacket {
  id: number;
  project_id: number;
  node_id: number | null;
  start_at: Date;
  end_at: Date;
  topic: string | null;
  status: string;
  created_by: number;
  created_at: Date;
}

export async function listSlots(expertId: number): Promise<SlotRow[]> {
  const [rows] = await pool.query<SlotRow[]>(
    `SELECT * FROM expert_availability_slots WHERE expert_id = ? ORDER BY weekday, start_time`,
    [expertId],
  );
  return rows;
}

export async function replaceSlots(
  expertId: number,
  slots: Array<{ weekday: number; startTime: string; endTime: string }>,
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM expert_availability_slots WHERE expert_id = ?`, [expertId]);
    for (const s of slots) {
      await conn.query(
        `INSERT INTO expert_availability_slots (expert_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)`,
        [expertId, s.weekday, s.startTime, s.endTime],
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function addBlackout(params: {
  expertId: number;
  startAt: string;
  endAt: string;
  reason?: string;
}): Promise<BlackoutRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO expert_availability_blackouts (expert_id, start_at, end_at, reason)
     VALUES (?, ?, ?, ?)`,
    [params.expertId, params.startAt, params.endAt, params.reason ?? null],
  );
  const [rows] = await pool.query<BlackoutRow[]>(
    `SELECT * FROM expert_availability_blackouts WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function listBlackouts(expertId: number): Promise<BlackoutRow[]> {
  const [rows] = await pool.query<BlackoutRow[]>(
    `SELECT * FROM expert_availability_blackouts WHERE expert_id = ? ORDER BY start_at DESC`,
    [expertId],
  );
  return rows;
}

export async function listAppointments(projectId: number): Promise<AppointmentRow[]> {
  const [rows] = await pool.query<AppointmentRow[]>(
    `SELECT * FROM project_appointments WHERE project_id = ? ORDER BY start_at`,
    [projectId],
  );
  return rows;
}

export async function createAppointment(params: {
  projectId: number;
  nodeId?: number;
  startAt: string;
  endAt: string;
  topic?: string;
  createdBy: number;
}): Promise<AppointmentRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO project_appointments (project_id, node_id, start_at, end_at, topic, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
    [
      params.projectId,
      params.nodeId ?? null,
      params.startAt,
      params.endAt,
      params.topic ?? null,
      params.createdBy,
    ],
  );
  const [rows] = await pool.query<AppointmentRow[]>(
    `SELECT * FROM project_appointments WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function updateAppointmentStatus(
  appointmentId: number,
  projectId: number,
  status: string,
): Promise<void> {
  await pool.query(
    `UPDATE project_appointments SET status = ? WHERE id = ? AND project_id = ?`,
    [status, appointmentId, projectId],
  );
}
