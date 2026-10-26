import { describe, expect, it } from "vitest";
import { AppError } from "../../src/errors/AppError.js";
import { attachClassPath, classJoinToken, parseClassJoinToken } from "../../src/services/classLink.js";

describe("class link", () => {
  it("round-trips an appointment id and hides cancelled classes", () => {
    const token = classJoinToken(78);
    expect(parseClassJoinToken(token)).toBe(78);
    expect(attachClassPath({ id: 78, status: "scheduled" }).classPath).toBe(`/?class=${token}`);
    expect(attachClassPath({ id: 78, status: "cancelled" }).classPath).toBeNull();
  });

  it("rejects a tampered token", () => {
    const token = classJoinToken(78);
    expect(() => parseClassJoinToken(token.replace(/^78\./, "79."))).toThrow(AppError);
  });
});
