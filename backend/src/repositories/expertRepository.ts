import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export type ProfileStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "suspended";

export interface ExpertProfileRow extends RowDataPacket {
  id: number;
  user_id: number;
  real_name: string | null;
  city: string | null;
  current_company: string | null;
  current_title: string | null;
  bio: string | null;
  education_json: unknown;
  work_experience_json: unknown;
  profile_status: ProfileStatus;
  accepting_projects: number;
  verified_at: Date | null;
  verified_by: number | null;
  reject_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ExpertListRow extends ExpertProfileRow {
  account: string | null;
  phone: string | null;
  user_status: string;
}

export async function findByUserId(userId: number): Promise<ExpertProfileRow | null> {
  const [rows] = await pool.query<ExpertProfileRow[]>(
    `SELECT * FROM expert_profiles WHERE user_id = ?`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function findById(id: number): Promise<ExpertProfileRow | null> {
  const [rows] = await pool.query<ExpertProfileRow[]>(
    `SELECT * FROM expert_profiles WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createProfile(userId: number, realName?: string | null): Promise<ExpertProfileRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO expert_profiles (user_id, real_name, profile_status)
     VALUES (?, ?, 'draft')`,
    [userId, realName ?? null],
  );
  const profile = await findById(result.insertId);
  if (!profile) throw new Error("Failed to create expert profile");
  return profile;
}

export async function updateProfile(
  userId: number,
  fields: {
    realName?: string | null;
    city?: string | null;
    currentCompany?: string | null;
    currentTitle?: string | null;
    bio?: string | null;
    educationJson?: unknown;
    workExperienceJson?: unknown;
    acceptingProjects?: boolean;
  },
): Promise<ExpertProfileRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (fields.realName !== undefined) {
    sets.push("real_name = ?");
    values.push(fields.realName);
  }
  if (fields.city !== undefined) {
    sets.push("city = ?");
    values.push(fields.city);
  }
  if (fields.currentCompany !== undefined) {
    sets.push("current_company = ?");
    values.push(fields.currentCompany);
  }
  if (fields.currentTitle !== undefined) {
    sets.push("current_title = ?");
    values.push(fields.currentTitle);
  }
  if (fields.bio !== undefined) {
    sets.push("bio = ?");
    values.push(fields.bio);
  }
  if (fields.educationJson !== undefined) {
    sets.push("education_json = ?");
    values.push(fields.educationJson ? JSON.stringify(fields.educationJson) : null);
  }
  if (fields.workExperienceJson !== undefined) {
    sets.push("work_experience_json = ?");
    values.push(fields.workExperienceJson ? JSON.stringify(fields.workExperienceJson) : null);
  }
  if (fields.acceptingProjects !== undefined) {
    sets.push("accepting_projects = ?");
    values.push(fields.acceptingProjects ? 1 : 0);
  }

  if (sets.length === 0) return findByUserId(userId);

  values.push(userId);
  await pool.query(`UPDATE expert_profiles SET ${sets.join(", ")} WHERE user_id = ?`, values);
  return findByUserId(userId);
}

export async function submitCertification(userId: number): Promise<ExpertProfileRow | null> {
  await pool.query(
    `UPDATE expert_profiles
     SET profile_status = 'pending_review', reject_reason = NULL
     WHERE user_id = ? AND profile_status IN ('draft', 'rejected')`,
    [userId],
  );
  return findByUserId(userId);
}

export async function listPendingCertifications(): Promise<ExpertListRow[]> {
  const [rows] = await pool.query<ExpertListRow[]>(
    `SELECT ep.*, u.account, u.phone, u.status AS user_status
     FROM expert_profiles ep
     JOIN users u ON u.id = ep.user_id
     WHERE ep.profile_status = 'pending_review'
     ORDER BY ep.updated_at DESC`,
  );
  return rows;
}

export async function approveCertification(
  expertId: number,
  adminUserId: number,
): Promise<ExpertProfileRow | null> {
  await pool.query(
    `UPDATE expert_profiles
     SET profile_status = 'active', verified_at = NOW(), verified_by = ?, reject_reason = NULL
     WHERE id = ? AND profile_status = 'pending_review'`,
    [adminUserId, expertId],
  );
  await pool.query(
    `UPDATE users u
     JOIN expert_profiles ep ON ep.user_id = u.id
     SET u.status = 'active'
     WHERE ep.id = ?`,
    [expertId],
  );
  return findById(expertId);
}

export async function rejectCertification(
  expertId: number,
  adminUserId: number,
  reason: string,
): Promise<ExpertProfileRow | null> {
  await pool.query(
    `UPDATE expert_profiles
     SET profile_status = 'rejected', verified_by = ?, reject_reason = ?, verified_at = NULL
     WHERE id = ? AND profile_status = 'pending_review'`,
    [adminUserId, reason, expertId],
  );
  return findById(expertId);
}
