import { describe, expect, it } from "vitest";
import type { PendingCertification } from "../../../services/api";
import { displayName, missingCount, reviewChecks } from "./reviewModel";

function item(partial: Partial<PendingCertification> = {}): PendingCertification {
  return {
    id: 1,
    userId: 2,
    account: "expert2",
    phone: null,
    realName: "expert2123",
    city: null,
    currentCompany: null,
    currentTitle: null,
    bio: null,
    workExperience: [],
    capabilities: { audiences: [], coachingTypes: [], industries: [], jobRoles: [] },
    profileStatus: "pending_review",
    submittedAt: "2026-10-26T07:41:35.000Z",
    ...partial,
  };
}

describe("reviewChecks", () => {
  it("marks a bare application as incomplete", () => {
    const checks = reviewChecks(item());
    expect(displayName(item())).toBe("expert2123");
    expect(missingCount(item())).toBe(6);
    expect(checks.find((check) => check.label === "姓名")?.filled).toBe(true);
    expect(checks.find((check) => check.label === "工作经历")?.detail).toBe("未填写");
  });

  it("counts filled profile, experience, and capabilities", () => {
    const full = item({
      phone: "13800001234",
      city: "上海",
      currentCompany: "字节跳动",
      currentTitle: "产品经理",
      bio: "做过校招面试官",
      workExperience: [{ company: "字节跳动", title: "产品经理", startDate: "2021-03", endDate: null }],
      capabilities: { audiences: ["fresh_grad"], coachingTypes: ["resume_optimization"], industries: [], jobRoles: [] },
    });
    expect(missingCount(full)).toBe(0);
    expect(reviewChecks(full).find((check) => check.label === "辅导能力")?.detail).toBe("已选 2 项");
  });
});
