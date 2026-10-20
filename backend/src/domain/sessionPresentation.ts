/** 课次/完成记录展示文案（PO Q-P3-07 / 学员状态 T-P3-STU-02） */

export function completionStatusLabel(
  status: string,
  expertCompletedAt?: Date | string | null,
): string {
  if (status === "completed") return "已完成";
  if (status === "deferred") return "已延期";
  if (status === "incomplete") return "未完成";
  if (status === "cancelled") return "已取消";
  if (expertCompletedAt) return "待班主任确认";
  return "待上课";
}

export function studentSessionStatusLabel(input: {
  status: string;
  startAt: Date | string;
  endAt?: Date | string;
  expertCompletedAt?: Date | string | null;
  opsConfirmedAt?: Date | string | null;
}): string {
  if (input.opsConfirmedAt || input.status === "completed") return "已完成";
  if (input.status === "incomplete") return "未完成";
  if (input.status === "deferred") return "已延期";
  if (input.status === "cancelled") return "已取消";
  if (input.expertCompletedAt) return "待班主任确认";
  const start = new Date(input.startAt);
  const now = Date.now();
  if (start.getTime() > now) return "即将上课";
  const end = input.endAt ? new Date(input.endAt) : start;
  if (end.getTime() >= now && start.getTime() <= now) return "进行中";
  return "待确认";
}

export function buildCompletionRecord(row: {
  status: string;
  expert_completed_at?: Date | null;
  student_name?: string | null;
  student_phone?: string | null;
  topic?: string | null;
  project_title?: string | null;
  start_at: Date;
  expert_name?: string | null;
  completion_notes?: string | null;
  defer_reason?: string | null;
}) {
  return {
    studentName: row.student_name ?? "",
    studentPhone: row.student_phone ?? "",
    course: row.topic ?? row.project_title ?? "",
    sessionTime: row.start_at,
    expertName: row.expert_name ?? "",
    status: completionStatusLabel(row.status, row.expert_completed_at),
    notes: row.completion_notes ?? row.defer_reason ?? "",
  };
}
