import { describe, it, expect } from "vitest";
import { splitProjectTotalCents } from "../src/services/sessionIncomeService.js";

describe("splitProjectTotalCents (Q-P2-06 A)", () => {
  it("single session gets full amount", () => {
    expect(splitProjectTotalCents(3000, 1)).toEqual([300000]);
  });

  it("splits evenly when divisible", () => {
    expect(splitProjectTotalCents(3000, 3)).toEqual([100000, 100000, 100000]);
  });

  it("last session absorbs remainder", () => {
    const parts = splitProjectTotalCents(1000, 3);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100000);
    expect(parts[2]).toBe(100000 - parts[0]! - parts[1]!);
  });
});
