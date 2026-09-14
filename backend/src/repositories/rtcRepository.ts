import { randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface RtcSessionRow extends RowDataPacket {
  id: number;
  channel_id: string;
  creator_id: number;
  callee_id: number;
  order_id: number | null;
  status: string;
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
  creator_account?: string;
  creator_phone?: string;
  callee_account?: string;
  callee_phone?: string;
}

export interface UserRow extends RowDataPacket {
  id: number;
  account: string;
  phone: string;
  role: string;
  status: string;
}

export async function createSession(params: {
  creatorId: number;
  calleeId: number;
  orderId?: number | null;
}): Promise<RtcSessionRow | null> {
  const [insertResult] = await pool.query<ResultSetHeader>(
    `INSERT INTO rtc_sessions (channel_id, creator_id, callee_id, order_id, status)
     VALUES ('', ?, ?, ?, 'pending')`,
    [params.creatorId, params.calleeId, params.orderId ?? null],
  );
  const sessionId = insertResult.insertId;
  const channelId = `rtc-${sessionId}-${randomBytes(4).toString("hex")}`;

  await pool.query(`UPDATE rtc_sessions SET channel_id = ? WHERE id = ?`, [
    channelId,
    sessionId,
  ]);

  return findByChannelId(channelId);
}

export async function findByChannelId(channelId: string): Promise<RtcSessionRow | null> {
  const [rows] = await pool.query<RtcSessionRow[]>(
    `SELECT s.*,
            cu.account AS creator_account, cu.phone AS creator_phone,
            ca.account AS callee_account, ca.phone AS callee_phone
     FROM rtc_sessions s
     JOIN users cu ON cu.id = s.creator_id
     JOIN users ca ON ca.id = s.callee_id
     WHERE s.channel_id = ?`,
    [channelId],
  );
  return rows[0] ?? null;
}

export async function listIncomingAsCallee(userId: number): Promise<RtcSessionRow[]> {
  const [rows] = await pool.query<RtcSessionRow[]>(
    `SELECT s.*,
            cu.account AS creator_account, cu.phone AS creator_phone,
            ca.account AS callee_account
     FROM rtc_sessions s
     JOIN users cu ON cu.id = s.creator_id
     JOIN users ca ON ca.id = s.callee_id
     WHERE s.callee_id = ?
       AND s.status IN ('pending', 'active')
     ORDER BY s.created_at DESC
     LIMIT 10`,
    [userId],
  );
  return rows;
}

export async function listForUser(
  userId: number,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<RtcSessionRow[]> {
  const [rows] = await pool.query<RtcSessionRow[]>(
    `SELECT s.*,
            cu.account AS creator_account,
            ca.account AS callee_account
     FROM rtc_sessions s
     JOIN users cu ON cu.id = s.creator_id
     JOIN users ca ON ca.id = s.callee_id
     WHERE s.creator_id = ? OR s.callee_id = ?
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, limit, offset],
  );
  return rows;
}

export async function markActive(channelId: string): Promise<void> {
  await pool.query(
    `UPDATE rtc_sessions SET status = 'active', started_at = COALESCE(started_at, NOW())
     WHERE channel_id = ? AND status = 'pending'`,
    [channelId],
  );
}

export async function markEnded(channelId: string): Promise<void> {
  await pool.query(
    `UPDATE rtc_sessions SET status = 'ended', ended_at = NOW() WHERE channel_id = ?`,
    [channelId],
  );
}

export async function findUserById(userId: number): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, account, phone, role, status FROM users WHERE id = ?`,
    [userId],
  );
  return rows[0] ?? null;
}
