import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import type { RowDataPacket } from "mysql2";
import pool from "../db/pool.js";
import * as userRepo from "../repositories/userRepository.js";

export async function verifyMagicLink(app: FastifyInstance, token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [rows] = await pool.query<
    Array<RowDataPacket & { id: number; user_id: number; expires_at: Date; used_at: Date | null }>
  >(
    `SELECT id, user_id, expires_at, used_at FROM student_login_tokens
     WHERE token_hash = ? AND type = 'magic_link' ORDER BY id DESC LIMIT 1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) throw new AppError("链接无效", 400);
  if (row.used_at) throw new AppError("链接已使用", 400);
  if (new Date(row.expires_at) < new Date()) throw new AppError("链接已过期", 400);

  const user = await userRepo.findById(row.user_id);
  if (!user || user.role !== "student") throw new AppError("学员账号无效", 400);

  await pool.query(`UPDATE student_login_tokens SET used_at = NOW() WHERE id = ?`, [row.id]);

  const jwt = app.jwt.sign({
    userId: user.id,
    role: user.role,
    account: user.account ?? undefined,
  });

  return {
    token: jwt,
    user: {
      id: user.id,
      account: user.account,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
}
