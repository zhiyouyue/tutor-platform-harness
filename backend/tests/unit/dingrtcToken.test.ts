import { describe, expect, it } from "vitest";
import tokenGenerator from "@dingrtc/token-generator";
import { buildDingRtcToken, readDingRtcTokenExpiry } from "../../src/services/dingrtcToken.js";

describe("dingrtc token expiry", () => {
  it("issues a token that stays valid for the requested ttl", () => {
    const now = 1_700_000_000;
    const token = buildDingRtcToken({
      appId: "testApp",
      appKey: "testKey1234567890123456789012345678",
      channelId: "rtc-1-abc",
      userId: "u1",
      ttlSeconds: 7200,
      nowSeconds: now,
    });
    expect(token.startsWith("000")).toBe(true);
    expect(readDingRtcTokenExpiry(token)).toBe(now + 7200);
  });

  it("official produce expires at the current second", () => {
    const produce = tokenGenerator.produce as unknown as (
      appId: string,
      appKey: string,
      channelId: string,
      userId: string,
    ) => string;
    const before = Math.floor(Date.now() / 1000);
    const token = produce("testApp", "testKey1234567890123456789012345678", "rtc-1-abc", "u1");
    const expiry = readDingRtcTokenExpiry(token);
    const after = Math.floor(Date.now() / 1000);
    expect(expiry).toBeGreaterThanOrEqual(before);
    expect(expiry).toBeLessThanOrEqual(after);
  });
});
