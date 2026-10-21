const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthUser {
  id: number;
  account: string | null;
  phone: string | null;
  role: string;
  status: string;
}

export interface DictItem {
  code: string;
  label: string;
}

export interface WorkExperienceItem {
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
}

export interface ExpertProfile {
  id: number;
  userId: number;
  account: string | null;
  phone: string | null;
  realName: string | null;
  city: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  bio: string | null;
  workExperience: WorkExperienceItem[];
  profileStatus: string;
  acceptingProjects: boolean;
  verifiedAt: string | null;
  rejectReason: string | null;
}

export interface Project {
  id: number;
  projectNo: string;
  title: string;
  studentId: number;
  expertId: number | null;
  status: string;
  totalAmount: number;
  studentName?: string;
  expertName?: string;
  nodes?: Array<{ id: number; nodeType: string; label?: string; status: string }>;
}

export interface Student {
  id: number;
  userId: number;
  realName: string | null;
  phone: string | null;
  city: string | null;
  status: string;
  career?: Record<string, unknown> | null;
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const method = (init.method ?? "GET").toUpperCase();
  const needsJsonBody = ["POST", "PUT", "PATCH"].includes(method);
  const body = init.body ?? (needsJsonBody ? "{}" : undefined);
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    body,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
      ...init.headers,
    },
  });
  return res.json() as Promise<ApiResponse<T>>;
}

// Auth
export const login = (account: string, password: string) =>
  apiFetch<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });

export const registerExpert = (body: { account: string; password: string; phone?: string; realName?: string }) =>
  apiFetch<{ token: string; user: AuthUser }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyMagicLink = (token: string) =>
  apiFetch<{ token: string; user: AuthUser }>(`/api/v1/auth/student/magic?token=${encodeURIComponent(token)}`);

// Dictionaries
export const fetchAllDictionaries = () =>
  apiFetch<{
    serviceAudiences: DictItem[];
    coachingTypes: DictItem[];
    industries: DictItem[];
    jobRoles: DictItem[];
  }>("/api/v1/dictionaries/all");

// Expert
export const fetchMyExpertProfile = () => apiFetch<ExpertProfile>("/api/v1/experts/me/profile");
export const updateMyExpertProfile = (body: Partial<ExpertProfile>) =>
  apiFetch<ExpertProfile>("/api/v1/experts/me/profile", { method: "PATCH", body: JSON.stringify(body) });
export const submitExpertCertification = () =>
  apiFetch<{ profileStatus: string }>("/api/v1/experts/me/certification/submit", { method: "POST" });
export const fetchMyCapabilities = () =>
  apiFetch<{ audiences: string[]; coachingTypes: string[]; industries: string[]; jobRoles: string[] }>(
    "/api/v1/experts/me/capabilities",
  );
export const saveMyCapabilities = (body: {
  audiences: string[];
  coachingTypes: string[];
  industries: string[];
  jobRoles: string[];
}) => apiFetch<unknown>("/api/v1/experts/me/capabilities", { method: "PUT", body: JSON.stringify(body) });

export const fetchMySchedule = () =>
  apiFetch<{
    slots: Array<{ weekday: number; startTime: string; endTime: string }>;
    blackouts: Array<{ id: number; startAt: string; endAt: string; reason: string | null }>;
  }>("/api/v1/experts/me/schedule");

export const saveMySchedule = (slots: Array<{ weekday: number; startTime: string; endTime: string }>) =>
  apiFetch<unknown>("/api/v1/experts/me/schedule", { method: "PUT", body: JSON.stringify({ slots }) });

export const addScheduleBlackout = (body: { startAt: string; endAt: string; reason?: string }) =>
  apiFetch<unknown>("/api/v1/experts/me/schedule/blackouts", { method: "POST", body: JSON.stringify(body) });

export const fetchExpertAppointments = () =>
  apiFetch<{ items: Array<Record<string, unknown>> }>("/api/v1/experts/me/appointments");

export const fetchExpertDashboard = () =>
  apiFetch<{
    profile: { realName: string | null; acceptingProjects: boolean; profileStatus: string };
    stats: { pendingConfirm: number; inProgress: number; completed: number; uniqueStudents: number };
    pendingProjects: Project[];
    todayAppointments: Array<Record<string, unknown>>;
    income: { total: number; pending: number; settled: number };
  }>("/api/v1/dashboard");

// Admin
export const fetchPendingCertifications = () =>
  apiFetch<{ items: Array<Record<string, unknown>> }>("/api/v1/admin/experts/certifications");
export const approveCertification = (expertId: number) =>
  apiFetch<unknown>(`/api/v1/admin/experts/${expertId}/certification/approve`, { method: "POST" });
export const rejectCertification = (expertId: number, reason: string) =>
  apiFetch<unknown>(`/api/v1/admin/experts/${expertId}/certification/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

// Ops
export const fetchStudents = () => apiFetch<{ items: Student[] }>("/api/v1/ops/students");
export const createStudent = (body: Record<string, unknown>) =>
  apiFetch<Student>("/api/v1/ops/students", { method: "POST", body: JSON.stringify(body) });
export const sendStudentLoginLink = (studentId: number) =>
  apiFetch<{ token: string; loginPath: string }>(`/api/v1/ops/students/${studentId}/send-login-link`, {
    method: "POST",
  });
export const fetchOpsExperts = () =>
  apiFetch<{ items: Array<{ id: number; realName: string | null }> }>("/api/v1/ops/experts");
export const fetchOpsProjects = () => apiFetch<{ items: Project[] }>("/api/v1/ops/projects");
export const fetchOpsProject = (projectId: number) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}`);
export const createProject = (body: Record<string, unknown>) =>
  apiFetch<Project>("/api/v1/ops/projects", { method: "POST", body: JSON.stringify(body) });
export const publishProject = (projectId: number) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}/publish`, { method: "POST" });
export const confirmProjectCompletion = (projectId: number) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}/completion/confirm`, { method: "POST" });
export const fetchOpsDashboard = () =>
  apiFetch<{
    stats: { totalStudents: number; activeProjects: number; pendingCompletionReview: number; weekAppointments: number };
    recentProjects: Project[];
    appointments: Array<Record<string, unknown>>;
    expertAvailability: Array<{ expertId: number; realName: string | null; slotCount: number; acceptingProjects: boolean }>;
  }>("/api/v1/ops/dashboard");
export const fetchOpsAppointments = () =>
  apiFetch<{ items: Array<Record<string, unknown>> }>("/api/v1/ops/appointments");
export const createOpsAppointment = (
  projectId: number,
  body: { startAt: string; endAt: string; topic?: string; meetingUrl?: string },
) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/projects/${projectId}/appointments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const createOpsAppointmentFromSlot = (
  projectId: number,
  body: { startAt: string; endAt: string; topic?: string },
) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/projects/${projectId}/appointments/from-slot`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const confirmOpsAppointmentCompletion = (appointmentId: number) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/appointments/${appointmentId}/confirm-completion`, {
    method: "POST",
  });
export const importStudents = (items: Array<Record<string, unknown>>) =>
  apiFetch<{ created: Student[]; failed: Array<{ phone: string; reason: string }> }>(
    "/api/v1/ops/students/import",
    { method: "POST", body: JSON.stringify({ items }) },
  );
export const fetchOpsFinanceSummary = () =>
  apiFetch<{ totalAmount: number; projectCount: number; byStatus: Record<string, { count: number; amount: number }> }>(
    "/api/v1/ops/finance/summary",
  );
export const fetchStudentAppointments = () =>
  apiFetch<{ items: Array<Record<string, unknown>> }>("/api/v1/student/appointments");
export const joinClassroom = (appointmentId: number) =>
  apiFetch<{ ready: boolean; message?: string; joinInfo?: Record<string, unknown> }>(
    `/api/v1/appointments/${appointmentId}/join-classroom`,
    { method: "POST" },
  );
export const fetchExpertScheduleSlots = (expertId: number) =>
  apiFetch<{
    items: Array<{ weekday: number; startTime: string; endTime: string }>;
    blackouts: Array<{ startAt: string; endAt: string; reason: string | null }>;
  }>(`/api/v1/ops/experts/${expertId}/schedule-slots`);
export const fetchAppointmentRecordings = (appointmentId: number) =>
  apiFetch<{ items: Array<{ id: number; ossKey: string; durationSec?: number | null; status: string }> }>(
    `/api/v1/appointments/${appointmentId}/recordings`,
  );
export const expertCompleteAppointment = (
  projectId: number,
  appointmentId: number,
  completionNotes?: string,
) =>
  apiFetch<Record<string, unknown>>(`/api/v1/projects/${projectId}/appointments/${appointmentId}/expert-complete`, {
    method: "POST",
    body: JSON.stringify(completionNotes ? { completionNotes } : {}),
  });
export const patchOpsProject = (
  projectId: number,
  body: { expertId?: number | null; title?: string; totalAmount?: number },
) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(body) });
export const deferOpsAppointment = (id: number, reason: string, startAt?: string, endAt?: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/appointments/${id}/defer`, {
    method: "POST",
    body: JSON.stringify({ reason, startAt, endAt }),
  });
export const rescheduleOpsAppointment = (id: number, startAt: string, endAt: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/appointments/${id}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ startAt, endAt }),
  });
export const markOpsAppointmentIncomplete = (id: number, reason: string, feeDeductAmount?: number) =>
  apiFetch<Record<string, unknown>>(`/api/v1/ops/appointments/${id}/mark-incomplete`, {
    method: "POST",
    body: JSON.stringify({ reason, feeDeductAmount }),
  });
export const fetchNotifications = () =>
  apiFetch<{ items: Array<{ id: number; title: string; body: string; readAt: string | null; createdAt: string }> }>(
    "/api/v1/notifications",
  );
export const markNotificationRead = (id: number) =>
  apiFetch<unknown>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
export const fetchAdminDashboardByExpert = () =>
  apiFetch<{
    items: Array<{ expertId: number | null; expertName: string | null; projectCount: number; inProgress: number }>;
  }>("/api/v1/admin/dashboard/by-expert");

// Projects
export const fetchProjects = () => apiFetch<{ items: Project[] }>("/api/v1/projects");
export const fetchProject = (id: number) => apiFetch<Project>(`/api/v1/projects/${id}`);
export const acceptProject = (id: number) =>
  apiFetch<Project>(`/api/v1/projects/${id}/accept`, { method: "POST" });
export const rejectProject = (id: number, reason: string) =>
  apiFetch<unknown>(`/api/v1/projects/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
export const submitProjectCompletion = (id: number) =>
  apiFetch<unknown>(`/api/v1/projects/${id}/completion/submit`, { method: "POST" });

// Delivery
export const fetchMessages = (projectId: number, channel?: string) =>
  apiFetch<{ items: Array<Record<string, unknown>> }>(
    `/api/v1/projects/${projectId}/messages${channel ? `?channel=${channel}` : ""}`,
  );
export const sendMessage = (projectId: number, content: string, channel: string) =>
  apiFetch<unknown>(`/api/v1/projects/${projectId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, channel }),
  });
export const createCoachingRecord = (projectId: number, body: Record<string, unknown>) =>
  apiFetch<unknown>(`/api/v1/projects/${projectId}/coaching-records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const createDeliverable = (projectId: number, body: { title: string; description?: string }) =>
  apiFetch<unknown>(`/api/v1/projects/${projectId}/deliverables`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const fetchAppointments = (projectId: number) =>
  apiFetch<{ items: Array<Record<string, unknown>> }>(`/api/v1/projects/${projectId}/appointments`);
export const createAppointment = (projectId: number, body: Record<string, unknown>) =>
  apiFetch<unknown>(`/api/v1/projects/${projectId}/appointments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const fetchProjectFiles = (projectId: number) =>
  apiFetch<{ items: Array<Record<string, unknown>> }>(`/api/v1/projects/${projectId}/files`);
export const requestFileUploadUrl = (projectId: number, fileName: string, mimeType: string) =>
  apiFetch<{ uploadUrl: string; ossKey: string; bucket: string; mode: string }>(
    `/api/v1/projects/${projectId}/files/upload-url`,
    { method: "POST", body: JSON.stringify({ fileName, mimeType }) },
  );
export const registerProjectFile = (
  projectId: number,
  body: { fileName: string; mimeType?: string; sizeBytes?: number; category?: string; ossKey?: string },
) =>
  apiFetch<unknown>(`/api/v1/projects/${projectId}/files`, { method: "POST", body: JSON.stringify(body) });

export async function uploadProjectFile(projectId: number, file: File, category = "other") {
  const urlRes = await requestFileUploadUrl(projectId, file.name, file.type || "application/octet-stream");
  if (urlRes.success && urlRes.data?.uploadUrl) {
    const putRes = await fetch(urlRes.data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    if (!putRes.ok) throw new Error("OSS 上传失败");
    return registerProjectFile(projectId, {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      category,
      ossKey: urlRes.data.ossKey,
    });
  }
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/files/local`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return res.json() as Promise<ApiResponse<unknown>>;
}

// Income
export const fetchIncomeSummary = () =>
  apiFetch<{ total: number; pending: number; settled: number }>("/api/v1/income/summary");
export const fetchIncomeTransactions = () =>
  apiFetch<{ items: Array<Record<string, unknown>> }>("/api/v1/income/transactions");

// Student
export const fetchStudentProjects = () => apiFetch<{ items: Project[] }>("/api/v1/student/projects");

// RTC
export const createRtcSession = (calleeId: number, appointmentId?: number) =>
  apiFetch<unknown>("/api/rtc/sessions", {
    method: "POST",
    body: JSON.stringify({ calleeId, appointmentId }),
  });
export const joinRtcSession = (channelId: string) =>
  apiFetch<Record<string, unknown>>(`/api/rtc/sessions/${channelId}/join`, { method: "POST" });
