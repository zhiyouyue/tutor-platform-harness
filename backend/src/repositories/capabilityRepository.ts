import type { RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface ExpertCapabilities {
  audiences: string[];
  coachingTypes: string[];
  industries: string[];
  jobRoles: string[];
}

async function listCodes(table: string, expertId: number, column: string): Promise<string[]> {
  const [rows] = await pool.query<Array<RowDataPacket & { code: string }>>(
    `SELECT ${column} AS code FROM ${table} WHERE expert_id = ?`,
    [expertId],
  );
  return rows.map((r) => r.code);
}

export async function getCapabilities(expertId: number): Promise<ExpertCapabilities> {
  const [audiences, coachingTypes, industries, jobRoles] = await Promise.all([
    listCodes("expert_service_audiences", expertId, "audience_code"),
    listCodes("expert_coaching_types", expertId, "coaching_code"),
    listCodes("expert_industries", expertId, "industry_code"),
    listCodes("expert_job_roles", expertId, "job_role_code"),
  ]);
  return { audiences, coachingTypes, industries, jobRoles };
}

export async function setCapabilities(expertId: number, caps: ExpertCapabilities): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM expert_service_audiences WHERE expert_id = ?`, [expertId]);
    await conn.query(`DELETE FROM expert_coaching_types WHERE expert_id = ?`, [expertId]);
    await conn.query(`DELETE FROM expert_industries WHERE expert_id = ?`, [expertId]);
    await conn.query(`DELETE FROM expert_job_roles WHERE expert_id = ?`, [expertId]);

    for (const code of caps.audiences) {
      await conn.query(
        `INSERT INTO expert_service_audiences (expert_id, audience_code) VALUES (?, ?)`,
        [expertId, code],
      );
    }
    for (const code of caps.coachingTypes) {
      await conn.query(
        `INSERT INTO expert_coaching_types (expert_id, coaching_code) VALUES (?, ?)`,
        [expertId, code],
      );
    }
    for (const code of caps.industries) {
      await conn.query(`INSERT INTO expert_industries (expert_id, industry_code) VALUES (?, ?)`, [
        expertId,
        code,
      ]);
    }
    for (const code of caps.jobRoles) {
      await conn.query(`INSERT INTO expert_job_roles (expert_id, job_role_code) VALUES (?, ?)`, [
        expertId,
        code,
      ]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
