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
  education: unknown;
  workExperience: unknown;
  profileStatus: string;
  acceptingProjects: boolean;
  verifiedAt: string | null;
  rejectReason: string | null;
}

export interface PendingCertification {
  id: number;
  userId: number;
  account: string | null;
  phone: string | null;
  realName: string | null;
  city: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  profileStatus: string;
  submittedAt: string;
}

export async function fetchHealth(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/api/v1/health`);
  if (!res.ok) throw new Error("health check failed");
  return res.json();
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...init.headers,
    },
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export async function login(account: string, password: string) {
  return apiFetch<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });
}

export async function registerExpert(body: {
  account: string;
  password: string;
  phone?: string;
  realName?: string;
}) {
  return apiFetch<{ token: string; user: AuthUser }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchMyExpertProfile() {
  return apiFetch<ExpertProfile>("/api/v1/experts/me/profile");
}

export async function updateMyExpertProfile(body: Partial<ExpertProfile>) {
  return apiFetch<ExpertProfile>("/api/v1/experts/me/profile", {
    method: "PATCH",
    body: JSON.stringify({
      realName: body.realName,
      city: body.city,
      currentCompany: body.currentCompany,
      currentTitle: body.currentTitle,
      bio: body.bio,
    }),
  });
}

export async function submitExpertCertification() {
  return apiFetch<{ profileStatus: string }>("/api/v1/experts/me/certification/submit", {
    method: "POST",
  });
}

export async function fetchPendingCertifications() {
  return apiFetch<{ items: PendingCertification[] }>("/api/v1/admin/experts/certifications");
}

export async function approveCertification(expertId: number) {
  return apiFetch<unknown>(`/api/v1/admin/experts/${expertId}/certification/approve`, {
    method: "POST",
  });
}

export async function rejectCertification(expertId: number, reason: string) {
  return apiFetch<unknown>(`/api/v1/admin/experts/${expertId}/certification/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function createRtcSession(calleeId: number, appointmentId?: number) {
  return apiFetch<unknown>("/api/rtc/sessions", {
    method: "POST",
    body: JSON.stringify({ calleeId, appointmentId }),
  });
}

export async function joinRtcSession(channelId: string) {
  return apiFetch<{
    appId: string;
    channel: string;
    uid: string;
    token: string;
    expiresAt: string;
    userName: string;
  }>(`/api/rtc/sessions/${channelId}/join`, { method: "POST" });
}
