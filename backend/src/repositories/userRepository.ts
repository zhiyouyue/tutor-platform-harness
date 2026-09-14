import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export type UserRole = "admin" | "expert" | "ops" | "student";
export type UserStatus = "active" | "pending" | "suspended";

export interface UserRow extends RowDataPacket {
  id: number;
  phone: string | null;
  account: string | null;
  password_hash: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export async function findById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, phone, account, password_hash, role, status, created_at, updated_at
     FROM users WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findByAccountOrPhone(identifier: string): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, phone, account, password_hash, role, status, created_at, updated_at
     FROM users
     WHERE account = ? OR phone = ?
     LIMIT 1`,
    [identifier, identifier],
  );
  return rows[0] ?? null;
}

export async function createUser(params: {
  account: string;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}): Promise<UserRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (account, phone, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      params.account,
      params.phone ?? null,
      params.passwordHash,
      params.role,
      params.status ?? "pending",
    ],
  );
  const user = await findById(result.insertId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function accountExists(account: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM users WHERE account = ? LIMIT 1`,
    [account],
  );
  return rows.length > 0;
}

export async function phoneExists(phone: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM users WHERE phone = ? LIMIT 1`,
    [phone],
  );
  return rows.length > 0;
}
