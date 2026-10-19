import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface NotificationRow extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  body: string;
  category: string;
  read_at: Date | null;
  created_at: Date;
}

export async function createNotification(params: {
  userId: number;
  title: string;
  body: string;
  category?: string;
}): Promise<NotificationRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO user_notifications (user_id, title, body, category) VALUES (?, ?, ?, ?)`,
    [params.userId, params.title, params.body, params.category ?? "general"],
  );
  const [rows] = await pool.query<NotificationRow[]>(
    `SELECT * FROM user_notifications WHERE id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function listForUser(userId: number, limit = 30): Promise<NotificationRow[]> {
  const [rows] = await pool.query<NotificationRow[]>(
    `SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit],
  );
  return rows;
}

export async function markRead(id: number, userId: number): Promise<void> {
  await pool.query(
    `UPDATE user_notifications SET read_at = NOW() WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
}
