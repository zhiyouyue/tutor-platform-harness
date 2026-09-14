import type { RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface DictRow extends RowDataPacket {
  code: string;
  label: string;
  sort_order: number;
}

export async function listServiceAudiences(): Promise<DictRow[]> {
  const [rows] = await pool.query<DictRow[]>(
    `SELECT code, label, sort_order FROM dict_service_audiences WHERE is_active = 1 ORDER BY sort_order`,
  );
  return rows;
}

export async function listCoachingTypes(): Promise<DictRow[]> {
  const [rows] = await pool.query<DictRow[]>(
    `SELECT code, label, sort_order FROM dict_coaching_types WHERE is_active = 1 ORDER BY sort_order`,
  );
  return rows;
}

export async function listIndustries(): Promise<DictRow[]> {
  const [rows] = await pool.query<DictRow[]>(
    `SELECT code, label, sort_order FROM dict_industries WHERE is_active = 1 ORDER BY sort_order`,
  );
  return rows;
}

export async function listJobRoles(): Promise<DictRow[]> {
  const [rows] = await pool.query<DictRow[]>(
    `SELECT code, label, sort_order FROM dict_job_roles WHERE is_active = 1 ORDER BY sort_order`,
  );
  return rows;
}
