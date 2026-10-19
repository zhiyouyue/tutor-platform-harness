import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface ProjectRow extends RowDataPacket {
  id: number;
  project_no: string;
  title: string;
  student_id: number;
  expert_id: number | null;
  ops_user_id: number;
  status: string;
  total_amount: string;
  currency: string;
  goals_json: unknown;
  reject_reason: string | null;
  accepted_at: Date | null;
  rejected_at: Date | null;
  published_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  student_name?: string;
  expert_name?: string;
}

export interface ProjectNodeRow extends RowDataPacket {
  id: number;
  project_id: number;
  node_type: string;
  sort_order: number;
  status: string;
  completed_at: Date | null;
  node_label?: string;
}

function genProjectNo(): string {
  return `P${Date.now().toString(36).toUpperCase()}`;
}

export async function createProject(params: {
  title: string;
  studentId: number;
  expertId?: number | null;
  opsUserId: number;
  totalAmount: number;
  goals?: string[];
  coachingTypes: string[];
}): Promise<ProjectRow> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const projectNo = genProjectNo();
    const [insert] = await conn.query<ResultSetHeader>(
      `INSERT INTO projects
       (project_no, title, student_id, expert_id, ops_user_id, status, total_amount, goals_json)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [
        projectNo,
        params.title,
        params.studentId,
        params.expertId ?? null,
        params.opsUserId,
        params.totalAmount,
        params.goals ? JSON.stringify(params.goals) : null,
      ],
    );
    const projectId = insert.insertId;
    let order = 0;
    for (const nodeType of params.coachingTypes) {
      await conn.query(
        `INSERT INTO project_nodes (project_id, node_type, sort_order) VALUES (?, ?, ?)`,
        [projectId, nodeType, order++],
      );
    }
    await conn.query(
      `INSERT INTO project_completions (project_id, status) VALUES (?, 'not_submitted')`,
      [projectId],
    );
    await conn.commit();
    const project = await findProjectById(projectId);
    if (!project) throw new Error("create project failed");
    return project;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function findProjectById(id: number): Promise<ProjectRow | null> {
  const [rows] = await pool.query<ProjectRow[]>(
    `SELECT p.*,
            sp.real_name AS student_name,
            ep.real_name AS expert_name
     FROM projects p
     JOIN student_profiles sp ON sp.id = p.student_id
     LEFT JOIN expert_profiles ep ON ep.id = p.expert_id
     WHERE p.id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function listProjects(filter: {
  expertId?: number;
  opsUserId?: number;
  studentId?: number;
  status?: string;
}): Promise<ProjectRow[]> {
  const clauses: string[] = ["1=1"];
  const values: unknown[] = [];
  if (filter.expertId != null) {
    clauses.push("p.expert_id = ?");
    values.push(filter.expertId);
  }
  if (filter.opsUserId != null) {
    clauses.push("p.ops_user_id = ?");
    values.push(filter.opsUserId);
  }
  if (filter.studentId != null) {
    clauses.push("p.student_id = ?");
    values.push(filter.studentId);
  }
  if (filter.status) {
    clauses.push("p.status = ?");
    values.push(filter.status);
  }
  const [rows] = await pool.query<ProjectRow[]>(
    `SELECT p.*, sp.real_name AS student_name, ep.real_name AS expert_name
     FROM projects p
     JOIN student_profiles sp ON sp.id = p.student_id
     LEFT JOIN expert_profiles ep ON ep.id = p.expert_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY p.created_at DESC`,
    values,
  );
  return rows;
}

export async function publishProject(id: number): Promise<void> {
  await pool.query(
    `UPDATE projects SET status = 'pending_confirm', published_at = NOW() WHERE id = ? AND status = 'draft'`,
    [id],
  );
}

export async function acceptProject(id: number, expertId: number): Promise<void> {
  await pool.query(
    `UPDATE projects SET status = 'in_progress', accepted_at = NOW(), expert_id = ?
     WHERE id = ? AND status = 'pending_confirm' AND (expert_id IS NULL OR expert_id = ?)`,
    [expertId, id, expertId],
  );
}

export async function rejectProject(id: number, expertId: number, reason: string): Promise<void> {
  await pool.query(
    `UPDATE projects SET status = 'rejected', rejected_at = NOW(), reject_reason = ?
     WHERE id = ? AND status = 'pending_confirm' AND expert_id = ?`,
    [reason, id, expertId],
  );
}

export async function listNodes(projectId: number): Promise<ProjectNodeRow[]> {
  const [rows] = await pool.query<ProjectNodeRow[]>(
    `SELECT pn.*, d.label AS node_label
     FROM project_nodes pn
     LEFT JOIN dict_coaching_types d ON d.code = pn.node_type
     WHERE pn.project_id = ?
     ORDER BY pn.sort_order`,
    [projectId],
  );
  return rows;
}

export async function completeNode(projectId: number, nodeId: number): Promise<void> {
  await pool.query(
    `UPDATE project_nodes SET status = 'completed', completed_at = NOW()
     WHERE id = ? AND project_id = ?`,
    [nodeId, projectId],
  );
}

export async function submitCompletion(projectId: number, expertUserId: number): Promise<void> {
  await pool.query(
    `UPDATE project_completions SET status = 'pending_ops_review', submitted_by = ?, submitted_at = NOW()
     WHERE project_id = ?`,
    [expertUserId, projectId],
  );
  await pool.query(
    `UPDATE projects SET status = 'pending_completion_review' WHERE id = ?`,
    [projectId],
  );
}

export async function confirmCompletion(projectId: number, opsUserId: number): Promise<ProjectRow | null> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE project_completions SET status = 'confirmed', reviewed_by = ?, reviewed_at = NOW()
       WHERE project_id = ? AND status = 'pending_ops_review'`,
      [opsUserId, projectId],
    );
    await conn.query(
      `UPDATE projects SET status = 'completed', completed_at = NOW() WHERE id = ?`,
      [projectId],
    );
    const [projRows] = await conn.query<ProjectRow[]>(`SELECT * FROM projects WHERE id = ?`, [projectId]);
    const proj = projRows[0];
    if (proj?.expert_id) {
      const [apptCnt] = await conn.query<Array<RowDataPacket & { cnt: number }>>(
        `SELECT COUNT(*) AS cnt FROM project_appointments WHERE project_id = ? AND status != 'cancelled'`,
        [projectId],
      );
      const hasSessionBilling = (apptCnt[0]?.cnt ?? 0) > 0;
      if (!hasSessionBilling) {
        await conn.query(
          `INSERT INTO income_lines (expert_id, project_id, amount, description, status)
           VALUES (?, ?, ?, ?, 'accrued')`,
          [proj.expert_id, projectId, proj.total_amount, proj.title],
        );
      }
    }
    await conn.commit();
    return findProjectById(projectId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function listExpertsForOps(): Promise<
  Array<{ id: number; userId: number; realName: string | null; profileStatus: string }>
> {
  const [rows] = await pool.query<
    Array<RowDataPacket & { id: number; user_id: number; real_name: string | null; profile_status: string }>
  >(
    `SELECT id, user_id, real_name, profile_status FROM expert_profiles
     WHERE profile_status = 'active' ORDER BY real_name`,
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    realName: r.real_name,
    profileStatus: r.profile_status,
  }));
}

export async function getProjectRevenueSummary(): Promise<{
  totalAmount: number;
  projectCount: number;
  byStatus: Record<string, { count: number; amount: number }>;
}> {
  const [rows] = await pool.query<
    Array<RowDataPacket & { status: string; cnt: number; amt: string }>
  >(
    `SELECT status, COUNT(*) AS cnt, COALESCE(SUM(total_amount), 0) AS amt
     FROM projects GROUP BY status`,
  );
  const byStatus: Record<string, { count: number; amount: number }> = {};
  let totalAmount = 0;
  let projectCount = 0;
  for (const r of rows) {
    const amount = parseFloat(r.amt);
    byStatus[r.status] = { count: r.cnt, amount };
    totalAmount += amount;
    projectCount += r.cnt;
  }
  return { totalAmount, projectCount, byStatus };
}
