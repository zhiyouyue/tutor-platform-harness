import { AppError } from "../errors/AppError.js";
import { fail } from "./response.js";

export function handleRouteError(reply: Parameters<typeof fail>[0], err: unknown) {
  if (err instanceof AppError) return fail(reply, err.message, err.statusCode);
  const e = err as { message?: string };
  return fail(reply, e.message || "服务器错误", 500);
}

export function formatProject(p: {
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
  student_name?: string;
  expert_name?: string;
}) {
  return {
    id: p.id,
    projectNo: p.project_no,
    title: p.title,
    studentId: p.student_id,
    expertId: p.expert_id,
    opsUserId: p.ops_user_id,
    status: p.status,
    totalAmount: parseFloat(p.total_amount),
    currency: p.currency,
    goals: p.goals_json,
    rejectReason: p.reject_reason,
    acceptedAt: p.accepted_at,
    rejectedAt: p.rejected_at,
    publishedAt: p.published_at,
    completedAt: p.completed_at,
    createdAt: p.created_at,
    studentName: p.student_name,
    expertName: p.expert_name,
  };
}
