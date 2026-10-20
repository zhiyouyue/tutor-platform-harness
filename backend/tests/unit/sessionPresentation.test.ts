import { describe, it, expect } from "vitest";
import {
  buildCompletionRecord,
  completionStatusLabel,
  studentSessionStatusLabel,
} from "../../src/domain/sessionPresentation.js";

describe("sessionPresentation", () => {
  it("completionStatusLabel covers PO statuses", () => {
    expect(completionStatusLabel("completed", null)).toBe("已完成");
    expect(completionStatusLabel("deferred", null)).toBe("已延期");
    expect(completionStatusLabel("incomplete", null)).toBe("未完成");
    expect(completionStatusLabel("cancelled", null)).toBe("已取消");
    expect(completionStatusLabel("confirmed", new Date())).toBe("待班主任确认");
    expect(completionStatusLabel("confirmed", null)).toBe("待上课");
  });

  it("studentSessionStatusLabel for lifecycle", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(
      studentSessionStatusLabel({ status: "confirmed", startAt: future }),
    ).toBe("即将上课");
    expect(
      studentSessionStatusLabel({
        status: "confirmed",
        startAt: past,
        endAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    ).toBe("进行中");
    expect(
      studentSessionStatusLabel({
        status: "confirmed",
        startAt: past,
        expertCompletedAt: new Date(),
      }),
    ).toBe("待班主任确认");
    expect(
      studentSessionStatusLabel({
        status: "completed",
        startAt: past,
        opsConfirmedAt: new Date(),
      }),
    ).toBe("已完成");
  });

  it("buildCompletionRecord Q-P3-07 fields", () => {
    const rec = buildCompletionRecord({
      status: "completed",
      student_name: "张三",
      student_phone: "13800000000",
      topic: "模拟面试",
      start_at: new Date("2026-01-01T10:00:00Z"),
      expert_name: "李老师",
      completion_notes: "表现良好",
    });
    expect(rec.studentName).toBe("张三");
    expect(rec.studentPhone).toBe("13800000000");
    expect(rec.course).toBe("模拟面试");
    expect(rec.expertName).toBe("李老师");
    expect(rec.status).toBe("已完成");
    expect(rec.notes).toBe("表现良好");
  });
});
