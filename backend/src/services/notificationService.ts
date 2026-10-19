import * as notificationRepo from "../repositories/notificationRepository.js";

export async function notifyInApp(params: {
  userId: number;
  title: string;
  body: string;
  category?: string;
}) {
  try {
    return await notificationRepo.createNotification(params);
  } catch {
    return null;
  }
}

export async function listMyNotifications(userId: number) {
  const rows = await notificationRepo.listForUser(userId);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    category: r.category,
    readAt: r.read_at,
    createdAt: r.created_at,
  }));
}

export async function markNotificationRead(id: number, userId: number) {
  await notificationRepo.markRead(id, userId);
}
