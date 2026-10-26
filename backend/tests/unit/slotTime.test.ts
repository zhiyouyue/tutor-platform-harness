import { describe, expect, it } from "vitest";
import { clockMinutes, minutesFromStartDay, normalizeSqlDateTime } from "../../src/services/slotTime.js";

describe("slotTime", () => {
  it("treats 24:00 as the end of the day and rewrites it for MySQL", () => {
    expect(clockMinutes("24:00:00")).toBe(24 * 60);
    expect(normalizeSqlDateTime("2026-10-25 24:00:00")).toBe("2026-10-26 00:00:00");
    expect(normalizeSqlDateTime("2026-10-26 18:30:00")).toBe("2026-10-26 18:30:00");
  });

  it("counts a class ending at the next midnight as 24:00 on the start day", () => {
    const start = new Date("2026-10-25T17:00:00");
    const end = new Date("2026-10-26T00:00:00");
    expect(minutesFromStartDay(start, end)).toBe(24 * 60);
    expect(minutesFromStartDay(new Date("2026-10-26T17:30:00"), new Date("2026-10-26T18:30:00"))).toBe(18 * 60 + 30);
  });
});
