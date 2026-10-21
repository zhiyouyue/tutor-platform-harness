import { describe, expect, it } from "vitest";
import { parseWorkExperience, readWorkExperience } from "../../src/domain/workExperience.js";

describe("workExperience", () => {
  it("accepts a current role and a finished role", () => {
    const parsed = parseWorkExperience([
      { company: " 示例科技 ", title: "产品经理", startDate: "2022-03", endDate: null },
      { company: "创业公司", title: "产品负责人", startDate: "2019-06", endDate: "2022-02" },
    ]);
    expect(parsed).toEqual({
      ok: true,
      items: [
        { company: "示例科技", title: "产品经理", startDate: "2022-03", endDate: null },
        { company: "创业公司", title: "产品负责人", startDate: "2019-06", endDate: "2022-02" },
      ],
    });
  });

  it("rejects an end month before the start month", () => {
    const parsed = parseWorkExperience([
      { company: "示例科技", title: "产品经理", startDate: "2022-03", endDate: "2021-01" },
    ]);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.message).toContain("不能早于开始时间");
  });

  it("rejects a missing company", () => {
    const parsed = parseWorkExperience([
      { company: "  ", title: "产品经理", startDate: "2022-03", endDate: null },
    ]);
    expect(parsed.ok).toBe(false);
  });

  it("reads stored JSON text and drops invalid legacy values", () => {
    expect(readWorkExperience(null)).toEqual([]);
    expect(readWorkExperience("not-json")).toEqual([]);
    expect(
      readWorkExperience(JSON.stringify([
        { company: "示例科技", title: "产品经理", startDate: "2022-03", endDate: "" },
      ])),
    ).toEqual([
      { company: "示例科技", title: "产品经理", startDate: "2022-03", endDate: null },
    ]);
    expect(readWorkExperience({ company: "不是数组" })).toEqual([]);
  });
});
