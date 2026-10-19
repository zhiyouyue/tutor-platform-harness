import bcrypt from "bcryptjs";
import { AppError } from "../errors/AppError.js";
import * as studentRepo from "../repositories/studentRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import { createHash, randomBytes } from "node:crypto";
import pool from "../db/pool.js";

export async function listStudents() {
  const rows = await studentRepo.listStudents();
  return rows.map(formatStudent);
}

export async function listStudentsForHomeroom(opsUserId: number) {
  const rows = await studentRepo.listStudentsForOpsUser(opsUserId);
  return rows.map(formatStudent);
}

export async function getStudent(id: number) {
  const row = await studentRepo.findStudentById(id);
  if (!row) throw new AppError("学员不存在", 404);
  const career = await studentRepo.getCareerProfile(id);
  return { ...formatStudent(row), career: career ? formatCareer(career) : null };
}

export async function createStudent(body: {
  realName: string;
  phone: string;
  password?: string;
  city?: string;
  school?: string;
  major?: string;
  graduationYear?: number;
  targetRole?: string;
  targetIndustry?: string;
  targetCity?: string;
  backgroundSummary?: string;
  coreIssues?: string;
}, opsUserId: number) {
  if (await userRepo.phoneExists(body.phone)) {
    throw new AppError("手机号已存在", 409);
  }
  const account = `stu_${body.phone.slice(-4)}_${Date.now().toString(36)}`;
  const passwordHash = bcrypt.hashSync(body.password || "student123", 10);
  const user = await userRepo.createUser({
    account,
    phone: body.phone,
    passwordHash,
    role: "student",
    status: "active",
  });
  const studentId = await studentRepo.createStudentProfile(user.id, body.realName);
  if (body.city) {
    await pool.query(`UPDATE student_profiles SET city = ? WHERE id = ?`, [body.city, studentId]);
  }
  await studentRepo.upsertCareerProfile(
    studentId,
    {
      school: body.school ?? null,
      major: body.major ?? null,
      graduation_year: body.graduationYear ?? null,
      target_industry: body.targetIndustry ?? null,
      target_role: body.targetRole ?? null,
      target_city: body.targetCity ?? null,
      background_summary: body.backgroundSummary ?? null,
      core_issues: body.coreIssues ?? null,
    } as never,
    opsUserId,
  );
  return getStudent(studentId);
}

export async function importStudents(
  items: Array<{
    realName: string;
    phone: string;
    school?: string;
    major?: string;
    targetRole?: string;
  }>,
  opsUserId: number,
) {
  const created: Awaited<ReturnType<typeof getStudent>>[] = [];
  const failed: Array<{ phone: string; reason: string }> = [];
  for (const item of items) {
    try {
      if (!item.realName?.trim() || !item.phone?.trim()) {
        failed.push({ phone: item.phone || "", reason: "姓名或手机号为空" });
        continue;
      }
      created.push(await createStudent(item, opsUserId));
    } catch (e) {
      const msg = e instanceof AppError ? e.message : "创建失败";
      failed.push({ phone: item.phone, reason: msg });
    }
  }
  return { created, failed };
}

export async function createLoginLink(studentId: number) {
  const student = await studentRepo.findStudentById(studentId);
  if (!student) throw new AppError("学员不存在", 404);
  const raw = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  await pool.query(
    `INSERT INTO student_login_tokens (user_id, token_hash, type, expires_at) VALUES (?, ?, 'magic_link', ?)`,
    [student.user_id, tokenHash, expiresAt],
  );
  return { token: raw, expiresAt: expiresAt.toISOString(), loginPath: `/auth/magic?token=${raw}` };
}

function formatStudent(row: studentRepo.StudentProfileRow) {
  return {
    id: row.id,
    userId: row.user_id,
    realName: row.real_name,
    city: row.city,
    studentType: row.student_type,
    account: row.account,
    phone: row.phone,
    status: row.user_status,
  };
}

function formatCareer(row: studentRepo.StudentCareerRow) {
  return {
    school: row.school,
    major: row.major,
    graduationYear: row.graduation_year,
    targetIndustry: row.target_industry,
    targetRole: row.target_role,
    targetCity: row.target_city,
    backgroundSummary: row.background_summary,
    currentSituation: row.current_situation,
    coreIssues: row.core_issues,
  };
}
