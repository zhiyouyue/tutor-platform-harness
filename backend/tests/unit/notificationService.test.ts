import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/repositories/notificationRepository.js", () => ({
  createNotification: vi.fn(async (p: { userId: number; title: string }) => ({
    id: 1,
    user_id: p.userId,
    title: p.title,
    body: "b",
    category: "general",
    read_at: null,
    created_at: new Date(),
  })),
  listForUser: vi.fn(async () => [
    {
      id: 2,
      user_id: 9,
      title: "t",
      body: "body",
      category: "appointment",
      read_at: null,
      created_at: new Date(),
    },
  ]),
  markRead: vi.fn(async () => undefined),
}));

import * as notificationService from "../../src/services/notificationService.js";
import * as notificationRepo from "../../src/repositories/notificationRepository.js";

describe("notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifyInApp delegates to repository", async () => {
    const row = await notificationService.notifyInApp({
      userId: 9,
      title: "新课次",
      body: "已排期",
    });
    expect(row?.title).toBe("新课次");
    expect(notificationRepo.createNotification).toHaveBeenCalledOnce();
  });

  it("listMyNotifications maps fields", async () => {
    const items = await notificationService.listMyNotifications(9);
    expect(items[0]?.body).toBe("body");
    expect(items[0]?.readAt).toBeNull();
  });

  it("markNotificationRead calls repo", async () => {
    await notificationService.markNotificationRead(2, 9);
    expect(notificationRepo.markRead).toHaveBeenCalledWith(2, 9);
  });
});
