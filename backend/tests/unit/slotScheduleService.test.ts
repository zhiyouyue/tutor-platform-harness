import { beforeEach, describe, expect, it, vi } from "vitest";

const listSlots = vi.fn();
const listBlackouts = vi.fn();

vi.mock("../../src/repositories/scheduleRepository.js", () => ({
  listSlots: (...args: unknown[]) => listSlots(...args),
  listBlackouts: (...args: unknown[]) => listBlackouts(...args),
}));

import { assertAppointmentInExpertSchedule } from "../../src/services/slotScheduleService.js";

describe("assertAppointmentInExpertSchedule", () => {
  beforeEach(() => {
    listSlots.mockReset();
    listBlackouts.mockReset();
    listBlackouts.mockResolvedValue([]);
  });

  it("rejects a time outside the expert windows by default", async () => {
    listSlots.mockResolvedValue([
      { weekday: 1, start_time: "17:30:00", end_time: "22:00:00" },
    ]);
    await expect(
      assertAppointmentInExpertSchedule(129, "2026-10-26 10:00:00", "2026-10-26 11:00:00"),
    ).rejects.toThrow("课次时间须落在专家开放时段内");
  });

  it("allows ops to book outside expert windows when allowOutsideOpenSlots is true", async () => {
    listSlots.mockResolvedValue([
      { weekday: 1, start_time: "17:30:00", end_time: "22:00:00" },
    ]);
    await expect(
      assertAppointmentInExpertSchedule(129, "2026-10-26 10:00:00", "2026-10-26 11:00:00", {
        allowOutsideOpenSlots: true,
      }),
    ).resolves.toBeUndefined();
  });

  it("still blocks blackout days for ops", async () => {
    listSlots.mockResolvedValue([]);
    listBlackouts.mockResolvedValue([
      { start_at: "2026-10-26 00:00:00", end_at: "2026-10-26 23:59:59" },
    ]);
    await expect(
      assertAppointmentInExpertSchedule(129, "2026-10-26 10:00:00", "2026-10-26 11:00:00", {
        allowOutsideOpenSlots: true,
      }),
    ).rejects.toThrow("该时段专家不可用");
  });
});
