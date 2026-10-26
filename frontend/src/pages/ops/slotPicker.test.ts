import { describe, expect, it } from "vitest";
import {
  defaultClassTimes,
  endOptions,
  slotsForDate,
  startOptions,
  summarizeSlots,
  toDateTime,
  weekdayOfDate,
} from "./slotPicker";

const slots = [
  { weekday: 0, startTime: "17:00:00", endTime: "24:00:00" },
  { weekday: 1, startTime: "17:30:00", endTime: "22:00:00" },
  { weekday: 5, startTime: "17:00:00", endTime: "21:30:00" },
];

describe("slotPicker", () => {
  it("reads the weekday of a calendar date", () => {
    expect(weekdayOfDate("2026-10-26")).toBe(1);
    expect(weekdayOfDate("2026-10-25")).toBe(0);
  });

  it("only offers the expert windows that fall on the chosen date", () => {
    expect(slotsForDate(slots, "2026-10-26").map((s) => s.weekday)).toEqual([1]);
    expect(slotsForDate(slots, "2026-10-27")).toEqual([]);
  });

  it("lets a class start and end inside the open window, defaulting to one hour", () => {
    const monday = slots[1]!;
    expect(startOptions(monday)[0]).toBe("17:30");
    expect(startOptions(monday).at(-1)).toBe("21:30");
    expect(endOptions(monday, "17:30")).toContain("18:30");
    expect(endOptions(monday, "17:30").at(-1)).toBe("22:00");
    expect(defaultClassTimes(monday)).toEqual({ start: "17:30", end: "18:30" });
  });

  it("turns an end of 24:00 into the next day's midnight", () => {
    expect(toDateTime("2026-10-25", "24:00")).toBe("2026-10-26 00:00:00");
    expect(toDateTime("2026-10-26", "18:30")).toBe("2026-10-26 18:30:00");
  });

  it("summarizes the weekly windows for the operator", () => {
    expect(summarizeSlots(slots)).toBe("周日 17:00–24:00、周一 17:30–22:00、周五 17:00–21:30");
  });
});
