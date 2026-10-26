import { describe, expect, it } from "vitest";
import {
  applyDrag,
  cellFromOffset,
  formatHm,
  HOUR_PX,
  mergeRanges,
  parseHm,
  rangesEqual,
} from "./availabilityMath";

describe("availabilityMath", () => {
  it("snaps a vertical drag to 30-minute cells, including upward drags", () => {
    const down = applyDrag([], { kind: "create", anchor: 19 * 60, current: 21 * 60 + 30 });
    expect(down).toEqual([{ start: 19 * 60, end: 22 * 60 }]);

    const up = applyDrag([], { kind: "create", anchor: 21 * 60 + 30, current: 19 * 60 });
    expect(up).toEqual([{ start: 19 * 60, end: 22 * 60 }]);
  });

  it("merges overlapping and adjacent ranges on the same day", () => {
    const merged = mergeRanges([
      { start: 19 * 60, end: 20 * 60 },
      { start: 20 * 60, end: 22 * 60 },
      { start: 9 * 60, end: 10 * 60 },
    ]);
    expect(merged).toEqual([
      { start: 9 * 60, end: 10 * 60 },
      { start: 19 * 60, end: 22 * 60 },
    ]);
  });

  it("moves a block and keeps it inside the day", () => {
    const moved = applyDrag([{ start: 19 * 60, end: 22 * 60 }], {
      kind: "move",
      index: 0,
      anchor: 19 * 60,
      origin: { start: 19 * 60, end: 22 * 60 },
      current: 22 * 60,
    });
    expect(moved).toEqual([{ start: 21 * 60, end: DAY_END(21) }]);
  });

  it("resizes from either edge and never inverts the range", () => {
    const origin = { start: 19 * 60, end: 22 * 60 };
    const later = applyDrag([origin], {
      kind: "resize",
      index: 0,
      edge: "end",
      origin,
      current: 22 * 60 + 30,
    });
    expect(later).toEqual([{ start: 19 * 60, end: 23 * 60 }]);

    const shrunk = applyDrag([origin], {
      kind: "resize",
      index: 0,
      edge: "start",
      origin,
      current: 23 * 60,
    });
    expect(shrunk).toEqual([{ start: 21 * 60 + 30, end: 22 * 60 }]);
  });

  it("reads the cell under the pointer", () => {
    expect(cellFromOffset(19 * HOUR_PX + 10)).toBe(19 * 60);
    expect(cellFromOffset(-20)).toBe(0);
    expect(formatHm(parseHm("19:00"))).toBe("19:00");
    expect(formatHm(24 * 60)).toBe("24:00");
    expect(rangesEqual([{ start: 0, end: 30 }], [{ start: 0, end: 30 }])).toBe(true);
  });
});

function DAY_END(hour: number): number {
  return (hour + 3) * 60;
}
