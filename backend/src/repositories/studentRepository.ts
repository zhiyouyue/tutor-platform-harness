import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface StudentProfileRow extends RowDataPacket {
  id: number;
  user_id: number;
  real_name: string | null;
  city: string | null;
  student_type: string | null;
  account: string | null;
  phone: string | null;
  user_status: string;
}

export interface StudentCareerRow extends RowDataPacket {
  id: number;
  student_id: number;
  school: string | null;
  major: string | null;
  graduation_year: number | null;
  target_industry: string | null;
  target_role: string | null;
  target_city: string | null;
  background_summary: string | null;
  current_situation: string | null;
  core_issues: string | null;
}

export async function listStudents(): Promise<StudentProfileRow[]> {
  const [rows] = await pool.query<StudentProfileRow[]>(
    `SELECT sp.*, u.account, u.phone, u.status AS user_status
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     ORDER BY sp.created_at DESC`,
  );
  return rows;
}

export async function findStudentById(id: number): Promise<StudentProfileRow | null> {
  const [rows] = await pool.query<StudentProfileRow[]>(
    `SELECT sp.*, u.account, u.phone, u.status AS user_status
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findStudentByUserId(userId: number): Promise<StudentProfileRow | null> {
  const [rows] = await pool.query<StudentProfileRow[]>(
    `SELECT sp.*, u.account, u.phone, u.status AS user_status
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = ?`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function createStudentProfile(userId: number, realName: string): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO student_profiles (user_id, real_name) VALUES (?, ?)`,
    [userId, realName],
  );
  return result.insertId;
}

export async function upsertCareerProfile(
  studentId: number,
  fields: Partial<StudentCareerRow>,
  maintainedBy?: number,
): Promise<void> {
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM student_career_profiles WHERE student_id = ?`,
    [studentId],
  );
  if (existing.length === 0) {
    await pool.query(
      `INSERT INTO student_career_profiles
       (student_id, school, major, graduation_year, target_industry, target_role, target_city,
        background_summary, current_situation, core_issues, maintained_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        fields.school ?? null,
        fields.major ?? null,
        fields.graduation_year ?? null,
        fields.target_industry ?? null,
        fields.target_role ?? null,
        fields.target_city ?? null,
        fields.background_summary ?? null,
        fields.current_situation ?? null,
        fields.core_issues ?? null,
        maintainedBy ?? null,
      ],
    );
    return;
  }
  await pool.query(
    `UPDATE student_career_profiles SET
       school = COALESCE(?, school),
       major = COALESCE(?, major),
       graduation_year = COALESCE(?, graduation_year),
       target_industry = COALESCE(?, target_industry),
       target_role = COALESCE(?, target_role),
       target_city = COALESCE(?, target_city),
       background_summary = COALESCE(?, background_summary),
       current_situation = COALESCE(?, current_situation),
       core_issues = COALESCE(?, core_issues),
       maintained_by = COALESCE(?, maintained_by)
     WHERE student_id = ?`,
    [
      fields.school ?? null,
      fields.major ?? null,
      fields.graduation_year ?? null,
      fields.target_industry ?? null,
      fields.target_role ?? null,
      fields.target_city ?? null,
      fields.background_summary ?? null,
      fields.current_situation ?? null,
      fields.core_issues ?? null,
      maintainedBy ?? null,
      studentId,
    ],
  );
}

export async function getCareerProfile(studentId: number): Promise<StudentCareerRow | null> {
  const [rows] = await pool.query<StudentCareerRow[]>(
    `SELECT * FROM student_career_profiles WHERE student_id = ?`,
    [studentId],
  );
  return rows[0] ?? null;
}
