/** 界面展示用中文状态，不直接暴露后端枚举英文 */

const FALLBACK = "—";

function pick(map: Record<string, string>, code: string | undefined | null): string {
  if (!code) return FALLBACK;
  return map[code] ?? FALLBACK;
}

export const PROJECT_STATUS: Record<string, string> = {
  draft: "草稿",
  published: "待接单",
  pending_confirm: "待专家确认",
  in_progress: "进行中",
  pending_completion_review: "待验收",
  completed: "已完成",
  rejected: "已拒绝",
  cancelled: "已取消",
};

export const APPOINTMENT_STATUS: Record<string, string> = {
  scheduled: "已排课",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
  deferred: "已延期",
  incomplete: "未完成",
};

export const EXPERT_PROFILE_STATUS: Record<string, string> = {
  draft: "草稿",
  pending_review: "待审核",
  active: "已认证",
  rejected: "已拒绝",
  suspended: "已暂停",
};

export const INCOME_STATUS: Record<string, string> = {
  accrued: "待结算",
  pending_settlement: "待结算",
  settled: "已结算",
  reversed: "已冲销",
};

export const NODE_STATUS: Record<string, string> = {
  pending: "未开始",
  in_progress: "进行中",
  completed: "已完成",
  skipped: "已跳过",
};

/** 辅导内容（与字典 code 一致时的兜底文案） */
export const COACHING_NODE_TYPE: Record<string, string> = {
  career_planning: "职业规划",
  resume_optimization: "简历优化",
  mock_interview: "模拟面试",
  interview_review: "面试复盘",
  salary_negotiation: "谈薪",
  offer_selection: "OFFER选择",
};

export function labelProjectStatus(status: string | undefined | null): string {
  return pick(PROJECT_STATUS, status);
}

export function labelAppointmentStatus(status: string | undefined | null): string {
  return pick(APPOINTMENT_STATUS, status);
}

export function labelExpertProfileStatus(status: string | undefined | null): string {
  return pick(EXPERT_PROFILE_STATUS, status);
}

export function labelIncomeStatus(status: string | undefined | null): string {
  return pick(INCOME_STATUS, status);
}

export function labelNodeStatus(status: string | undefined | null): string {
  return pick(NODE_STATUS, status);
}

export function labelCoachingNodeType(nodeType: string | undefined | null, label?: string | null): string {
  if (label?.trim()) return label.trim();
  return pick(COACHING_NODE_TYPE, nodeType);
}

export const projectStatusTagClass: Record<string, string> = {
  in_progress: "ant-tag ant-tag-blue",
  completed: "ant-tag ant-tag-green",
  pending_confirm: "ant-tag ant-tag-orange",
  published: "ant-tag ant-tag-orange",
  pending_completion_review: "ant-tag ant-tag-orange",
  draft: "ant-tag ant-tag-gray",
  rejected: "ant-tag ant-tag-gray",
  cancelled: "ant-tag ant-tag-gray",
};

export const appointmentStatusTagClass: Record<string, string> = {
  scheduled: "ant-tag ant-tag-blue",
  confirmed: "ant-tag ant-tag-blue",
  completed: "ant-tag ant-tag-green",
  cancelled: "ant-tag ant-tag-gray",
  deferred: "ant-tag ant-tag-orange",
  incomplete: "ant-tag ant-tag-red",
};
