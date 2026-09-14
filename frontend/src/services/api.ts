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
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...init.headers },
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
export const createProject = (body: Record<string, unknown>) =>
  apiFetch<Project>("/api/v1/ops/projects", { method: "POST", body: JSON.stringify(body) });
export const publishProject = (projectId: number) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}/publish`, { method: "POST" });
export const confirmProjectCompletion = (projectId: number) =>
  apiFetch<Project>(`/api/v1/ops/projects/${projectId}/completion/confirm`, { method: "POST" });

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
