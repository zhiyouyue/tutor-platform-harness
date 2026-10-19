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
  meeting_url: string | null;
  status: string;
  expert_completed_at: Date | null;
  ops_confirmed_at: Date | null;
  created_by: number;
  created_at: Date;
}

export interface AppointmentDetailRow extends AppointmentRow {
  project_title?: string;
  student_name?: string;
  expert_name?: string;
}

export interface ExpertAvailabilitySummaryRow extends RowDataPacket {
  expert_id: number;
  real_name: string | null;
  slot_count: number;
  accepting_projects: number;
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

export async function findAppointmentById(id: number): Promise<AppointmentRow | null> {
  const [rows] = await pool.query<AppointmentRow[]>(
    `SELECT * FROM project_appointments WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createAppointment(params: {
  projectId: number;
  nodeId?: number;
  startAt: string;
  endAt: string;
  topic?: string;
  meetingUrl?: string;
  createdBy: number;
  status?: string;
}): Promise<AppointmentRow> {
  const status = params.status ?? "scheduled";
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO project_appointments (project_id, node_id, start_at, end_at, topic, meeting_url, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.projectId,
      params.nodeId ?? null,
      params.startAt,
      params.endAt,
      params.topic ?? null,
      params.meetingUrl ?? null,
      params.createdBy,
      status,
    ],
  );
  const [rows] = await pool.query<AppointmentRow[]>(
    `SELECT * FROM project_appointments WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function updateAppointment(
  appointmentId: number,
  patch: {
    meetingUrl?: string;
    status?: string;
    expertCompletedAt?: Date;
    opsConfirmedAt?: Date;
  },
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (patch.meetingUrl !== undefined) {
    sets.push("meeting_url = ?");
    vals.push(patch.meetingUrl);
  }
  if (patch.status !== undefined) {
    sets.push("status = ?");
    vals.push(patch.status);
  }
  if (patch.expertCompletedAt !== undefined) {
    sets.push("expert_completed_at = ?");
    vals.push(patch.expertCompletedAt);
  }
  if (patch.opsConfirmedAt !== undefined) {
    sets.push("ops_confirmed_at = ?");
    vals.push(patch.opsConfirmedAt);
  }
  if (sets.length === 0) return;
  vals.push(appointmentId);
  await pool.query(`UPDATE project_appointments SET ${sets.join(", ")} WHERE id = ?`, vals);
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

const APPOINTMENT_DETAIL_SQL = `
  SELECT pa.*, p.title AS project_title,
         sp.real_name AS student_name, ep.real_name AS expert_name
  FROM project_appointments pa
  JOIN projects p ON p.id = pa.project_id
  LEFT JOIN student_profiles sp ON sp.id = p.student_id
  LEFT JOIN expert_profiles ep ON ep.id = p.expert_id
`;

export async function listTodayAppointmentsForExpert(expertId: number): Promise<AppointmentDetailRow[]> {
  const [rows] = await pool.query<AppointmentDetailRow[]>(
    `${APPOINTMENT_DETAIL_SQL}
     WHERE p.expert_id = ? AND DATE(pa.start_at) = CURDATE()
     ORDER BY pa.start_at`,
    [expertId],
  );
  return rows;
}

export async function listUpcomingForExpert(
  expertId: number,
  limit = 10,
): Promise<AppointmentDetailRow[]> {
  const [rows] = await pool.query<AppointmentDetailRow[]>(
    `${APPOINTMENT_DETAIL_SQL}
     WHERE p.expert_id = ? AND pa.start_at >= NOW()
     ORDER BY pa.start_at
     LIMIT ?`,
    [expertId, limit],
  );
  return rows;
}

export async function listAllAppointments(limit = 50): Promise<AppointmentDetailRow[]> {
  const [rows] = await pool.query<AppointmentDetailRow[]>(
    `${APPOINTMENT_DETAIL_SQL}
     ORDER BY pa.start_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows;
}

export async function countActiveAppointmentsForProject(projectId: number): Promise<number> {
  const [rows] = await pool.query<Array<RowDataPacket & { cnt: number }>>(
    `SELECT COUNT(*) AS cnt FROM project_appointments WHERE project_id = ? AND status != 'cancelled'`,
    [projectId],
  );
  return rows[0]?.cnt ?? 0;
}

export async function listActiveAppointmentIdsForProject(projectId: number): Promise<number[]> {
  const [rows] = await pool.query<Array<RowDataPacket & { id: number }>>(
    `SELECT id FROM project_appointments
     WHERE project_id = ? AND status != 'cancelled'
     ORDER BY start_at, id`,
    [projectId],
  );
  return rows.map((r) => r.id);
}

export async function listAppointmentsForStudent(studentProfileId: number): Promise<AppointmentDetailRow[]> {
  const [rows] = await pool.query<AppointmentDetailRow[]>(
    `${APPOINTMENT_DETAIL_SQL}
     WHERE p.student_id = ?
     ORDER BY pa.start_at DESC
     LIMIT 100`,
    [studentProfileId],
  );
  return rows;
}

export async function listExpertAvailabilitySummary(): Promise<ExpertAvailabilitySummaryRow[]> {
  const [rows] = await pool.query<ExpertAvailabilitySummaryRow[]>(
    `SELECT ep.id AS expert_id, ep.real_name, ep.accepting_projects,
            COUNT(s.id) AS slot_count
     FROM expert_profiles ep
     LEFT JOIN expert_availability_slots s ON s.expert_id = ep.id
     WHERE ep.profile_status = 'active'
     GROUP BY ep.id, ep.real_name, ep.accepting_projects
     ORDER BY ep.real_name`,
  );
  return rows;
}
