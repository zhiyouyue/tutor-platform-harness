import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import tokenGenerator from "@dingrtc/token-generator";
import { toRtcUserId } from "../../src/services/rtcService.js";

describe("RTC token", () => {
  it("toRtcUserId format", () => {
    expect(toRtcUserId(42)).toBe("u42");
  });

  it("legacy sha256 token length", () => {
    const token = createHash("sha256")
      .update("testAppIdtestAppKeyrtc-1-abc12345u42AK-deadbeef1725789012")
      .digest("hex");
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it("dingrtc AppToken format", () => {
    const produce = tokenGenerator.produce as (
      appId: string,
      appKey: string,
      channelId: string,
      userId: string,
    ) => string;
    const token = produce(
      "testApp",
      "testKey1234567890123456789012345678",
      "rtc-1-abc",
      "u1",
    );
    expect(token.startsWith("000")).toBe(true);
    expect(token.length).toBeGreaterThan(50);
  });
});
