import { describe, expect, it } from "vitest";
import {
  labelAppointmentStatus,
  labelExpertProfileStatus,
  labelIncomeStatus,
  labelProjectStatus,
} from "./statusLabels";

describe("statusLabels", () => {
  it("maps project statuses to Chinese", () => {
    expect(labelProjectStatus("in_progress")).toBe("进行中");
    expect(labelProjectStatus("pending_confirm")).toBe("待专家确认");
    expect(labelProjectStatus("draft")).toBe("草稿");
  });

  it("does not expose raw English codes", () => {
    expect(labelProjectStatus("in_progress")).not.toContain("_");
    expect(labelAppointmentStatus("scheduled")).toBe("已排课");
    expect(labelIncomeStatus("settled")).toBe("已结算");
    expect(labelExpertProfileStatus("pending_review")).toBe("待审核");
  });
});
