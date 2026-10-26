import { describe, expect, it } from "vitest";
import {
  buildWeekDays,
  clampCreate,
  isoDate,
  placeMove,
  rangeStartsInPast,
  weekDates,
} from "./bookingMath";

const slots = [
  { weekday: 0, startTime: "17:00:00", endTime: "24:00:00" },
  { weekday: 1, startTime: "17:30:00", endTime: "22:00:00" },
  { weekday: 5, startTime: "17:00:00", endTime: "21:30:00" },
];

describe("bookingMath", () => {
  const now = new Date("2026-10-26T12:00:00");

  it("lays the visible week out from Monday, with dates", () => {
    const days = weekDates(now).map(isoDate);
    expect(days).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });

  it("paints only the expert windows for each upcoming day", () => {
    const days = buildWeekDays(now, slots, [], [], now);
    const monday = days.find((day) => day.iso === "2026-10-26");
    const tuesday = days.find((day) => day.iso === "2026-10-27");
    const sunday = days.find((day) => day.iso === "2026-11-01");
    expect(monday?.open).toEqual([{ start: 17 * 60 + 30, end: 22 * 60 }]);
    expect(tuesday?.open).toEqual([]);
    expect(sunday?.open).toEqual([{ start: 17 * 60, end: 24 * 60 }]);
  });

  it("hides a day the expert has blocked out", () => {
    const days = buildWeekDays(now, slots, [{ startAt: "2026-10-26 00:00:00", endAt: "2026-10-26 23:59:59" }], [], now);
    expect(days.find((day) => day.iso === "2026-10-26")?.closed).toBe(true);
    expect(days.find((day) => day.iso === "2026-10-26")?.open).toEqual([]);
  });

  it("keeps a drag inside the open window and off existing classes", () => {
    const window = { start: 17 * 60 + 30, end: 22 * 60 };
    expect(clampCreate(window, 18 * 60, 19 * 60, [])).toEqual({ start: 18 * 60, end: 19 * 60 + 30 });
    expect(clampCreate(window, 21 * 60, 22 * 60, [])).toEqual({ start: 21 * 60, end: 22 * 60 });
    expect(clampCreate(window, 12 * 60, 13 * 60, [])).toBeNull();
    expect(clampCreate(window, 18 * 60, 19 * 60, [{ start: 18 * 60 + 30, end: 19 * 60 }])).toBeNull();
  });

  it("moves a booked class inside the open window and keeps its length", () => {
    const window = { start: 17 * 60 + 30, end: 22 * 60 };
    const origin = { start: 20 * 60, end: 21 * 60 };
    expect(placeMove(origin, 20 * 60, 19 * 60, [window], [])).toEqual({ start: 19 * 60, end: 20 * 60 });
    expect(placeMove(origin, 20 * 60, 21 * 60 + 30, [window], [])).toBeNull();
    expect(placeMove(origin, 20 * 60, 19 * 60, [window], [{ start: 19 * 60, end: 19 * 60 + 30 }])).toBeNull();
  });

  it("rejects a start that is already in the past", () => {
    expect(rangeStartsInPast("2026-10-26", 11 * 60, now)).toBe(true);
    expect(rangeStartsInPast("2026-10-26", 17 * 60 + 30, now)).toBe(false);
  });
});
