import type { RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface IncomeLineRow extends RowDataPacket {
  id: number;
  expert_id: number;
  project_id: number;
  appointment_id: number | null;
  amount: string;
  currency: string;
  status: string;
  description: string | null;
  accrued_at: Date;
  settled_at: Date | null;
  project_title?: string;
}

export async function listByExpert(expertId: number): Promise<IncomeLineRow[]> {
  const [rows] = await pool.query<IncomeLineRow[]>(
    `SELECT il.*, p.title AS project_title
     FROM income_lines il
     JOIN projects p ON p.id = il.project_id
     WHERE il.expert_id = ?
     ORDER BY il.accrued_at DESC`,
    [expertId],
  );
  return rows;
}

export async function getSummary(expertId: number) {
  const [rows] = await pool.query<
    Array<IncomeLineRow & { total: string; pending: string; settled: string }>
  >(
    `SELECT
       COALESCE(SUM(amount), 0) AS total,
       COALESCE(SUM(CASE WHEN status IN ('accrued','pending_settlement') THEN amount ELSE 0 END), 0) AS pending,
       COALESCE(SUM(CASE WHEN status = 'settled' THEN amount ELSE 0 END), 0) AS settled
     FROM income_lines WHERE expert_id = ?`,
    [expertId],
  );
  return rows[0] ?? { total: "0", pending: "0", settled: "0" };
}

export async function existsForAppointment(appointmentId: number): Promise<boolean> {
  const [rows] = await pool.query<Array<RowDataPacket & { cnt: number }>>(
    `SELECT COUNT(*) AS cnt FROM income_lines WHERE appointment_id = ?`,
    [appointmentId],
  );
  return (rows[0]?.cnt ?? 0) > 0;
}

export async function insertLine(params: {
  expertId: number;
  projectId: number;
  appointmentId?: number | null;
  amount: number;
  description?: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO income_lines (expert_id, project_id, appointment_id, amount, description, status)
     VALUES (?, ?, ?, ?, ?, 'accrued')`,
    [
      params.expertId,
      params.projectId,
      params.appointmentId ?? null,
      params.amount,
      params.description ?? null,
    ],
  );
}
