const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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

/** 阿里云 RTC：创建 1v1 会话 */
export async function createRtcSession(calleeId: number, orderId?: number) {
  return apiFetch<unknown>("/api/rtc/sessions", {
    method: "POST",
    body: JSON.stringify({ calleeId, orderId }),
  });
}

/** 阿里云 RTC：获取入会凭证 */
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
