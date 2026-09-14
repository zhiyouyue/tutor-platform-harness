import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool.js";

export interface MessageRow extends RowDataPacket {
  id: number;
  project_id: number;
  sender_user_id: number;
  sender_role: string;
  channel: string;
  content: string;
  created_at: Date;
  sender_name?: string;
}

export interface FileRow extends RowDataPacket {
  id: number;
  project_id: number;
  uploader_user_id: number;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  oss_bucket: string;
  oss_key: string;
  category: string;
  created_at: Date;
}

export interface CoachingRecordRow extends RowDataPacket {
  id: number;
  project_id: number;
  node_id: number | null;
  expert_id: number;
  coached_at: Date;
  content_summary: string | null;
  student_issues: string | null;
  expert_advice: string | null;
  created_at: Date;
}

export interface DeliverableRow extends RowDataPacket {
  id: number;
  project_id: number;
  node_id: number | null;
  expert_id: number;
  title: string;
  description: string | null;
  submitted_at: Date;
}

export async function listMessages(
  projectId: number,
  channel?: string,
): Promise<MessageRow[]> {
  const values: unknown[] = [projectId];
  let channelSql = "";
  if (channel) {
    channelSql = " AND channel = ?";
    values.push(channel);
  }
  const [rows] = await pool.query<MessageRow[]>(
    `SELECT m.*, COALESCE(ep.real_name, sp.real_name, u.account) AS sender_name
     FROM project_messages m
     JOIN users u ON u.id = m.sender_user_id
     LEFT JOIN expert_profiles ep ON ep.user_id = u.id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE m.project_id = ?${channelSql}
     ORDER BY m.created_at ASC`,
    values,
  );
  return rows;
}

export async function createMessage(params: {
  projectId: number;
  senderUserId: number;
  senderRole: string;
  channel: string;
  content: string;
}): Promise<MessageRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO project_messages (project_id, sender_user_id, sender_role, channel, content)
     VALUES (?, ?, ?, ?, ?)`,
    [params.projectId, params.senderUserId, params.senderRole, params.channel, params.content],
  );
  const [rows] = await pool.query<MessageRow[]>(
    `SELECT m.*, u.account AS sender_name FROM project_messages m
     JOIN users u ON u.id = m.sender_user_id WHERE m.id = ?`,
    [result.insertId],
  );
  return rows[0]!;
}

export async function listFiles(projectId: number): Promise<FileRow[]> {
  const [rows] = await pool.query<FileRow[]>(
    `SELECT * FROM project_files WHERE project_id = ? ORDER BY created_at DESC`,
    [projectId],
  );
  return rows;
}

export async function createFile(params: {
  projectId: number;
  uploaderUserId: number;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
  category: string;
}): Promise<FileRow> {
  const bucket = process.env.OSS_BUCKET || "local-dev";
  const key = `projects/${params.projectId}/${Date.now()}-${params.fileName}`;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO project_files
     (project_id, uploader_user_id, file_name, mime_type, size_bytes, oss_bucket, oss_key, category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.projectId,
      params.uploaderUserId,
      params.fileName,
      params.mimeType ?? null,
      params.sizeBytes ?? null,
      bucket,
      key,
      params.category,
    ],
  );
  const [rows] = await pool.query<FileRow[]>(`SELECT * FROM project_files WHERE id = ?`, [
    result.insertId,
  ]);
  return rows[0]!;
}

export async function listCoachingRecords(projectId: number): Promise<CoachingRecordRow[]> {
  const [rows] = await pool.query<CoachingRecordRow[]>(
    `SELECT * FROM coaching_records WHERE project_id = ? ORDER BY coached_at DESC`,
    [projectId],
  );
  return rows;
}

export async function createCoachingRecord(params: {
  projectId: number;
  nodeId?: number;
  expertId: number;
  coachedAt: string;
  contentSummary?: string;
  studentIssues?: string;
  expertAdvice?: string;
}): Promise<CoachingRecordRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO coaching_records
     (project_id, node_id, expert_id, coached_at, content_summary, student_issues, expert_advice)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      params.projectId,
      params.nodeId ?? null,
      params.expertId,
      params.coachedAt,
      params.contentSummary ?? null,
      params.studentIssues ?? null,
      params.expertAdvice ?? null,
    ],
  );
  const [rows] = await pool.query<CoachingRecordRow[]>(`SELECT * FROM coaching_records WHERE id = ?`, [
    result.insertId,
  ]);
  return rows[0]!;
}

export async function listDeliverables(projectId: number): Promise<DeliverableRow[]> {
  const [rows] = await pool.query<DeliverableRow[]>(
    `SELECT * FROM deliverables WHERE project_id = ? ORDER BY submitted_at DESC`,
    [projectId],
  );
  return rows;
}

export async function createDeliverable(params: {
  projectId: number;
  nodeId?: number;
  expertId: number;
  title: string;
  description?: string;
}): Promise<DeliverableRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO deliverables (project_id, node_id, expert_id, title, description)
     VALUES (?, ?, ?, ?, ?)`,
    [params.projectId, params.nodeId ?? null, params.expertId, params.title, params.description ?? null],
  );
  const [rows] = await pool.query<DeliverableRow[]>(`SELECT * FROM deliverables WHERE id = ?`, [
    result.insertId,
  ]);
  return rows[0]!;
}
