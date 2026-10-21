export interface WorkExperienceItem {
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_ITEMS = 20;
const MAX_LEN = 80;

export type WorkExperienceParse =
  | { ok: true; items: WorkExperienceItem[] }
  | { ok: false; message: string };

function fail(message: string): { ok: false; message: string } {
  return { ok: false, message };
}

export function parseWorkExperience(input: unknown): WorkExperienceParse {
  if (input == null) return { ok: true, items: [] };
  if (!Array.isArray(input)) return fail("工作经历格式不正确");
  if (input.length > MAX_ITEMS) return fail(`工作经历最多 ${MAX_ITEMS} 条`);

  const items: WorkExperienceItem[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const parsed = parseItem(input[index], index + 1);
    if (!parsed.ok) return parsed;
    items.push(parsed.item);
  }
  return { ok: true, items };
}

function parseItem(
  input: unknown,
  index: number,
): { ok: true; item: WorkExperienceItem } | { ok: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return fail(`第 ${index} 条工作经历格式不正确`);
  }
  const row = input as Record<string, unknown>;
  const company = typeof row.company === "string" ? row.company.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const startDate = typeof row.startDate === "string" ? row.startDate.trim() : "";
  const endRaw = readEndDate(row.endDate);

  if (!company) return fail(`第 ${index} 条请填写公司`);
  if (!title) return fail(`第 ${index} 条请填写职位`);
  if (company.length > MAX_LEN || title.length > MAX_LEN) {
    return fail(`第 ${index} 条公司或职位不能超过 ${MAX_LEN} 个字`);
  }
  if (!MONTH.test(startDate)) return fail(`第 ${index} 条开始时间请选择到月份`);
  if (endRaw === "invalid" || (endRaw && !MONTH.test(endRaw))) {
    return fail(`第 ${index} 条结束时间请选择到月份，或留空表示至今`);
  }
  if (endRaw && endRaw < startDate) return fail(`第 ${index} 条结束时间不能早于开始时间`);

  return { ok: true, item: { company, title, startDate, endDate: endRaw || null } };
}

function readEndDate(value: unknown): string | "invalid" {
  if (value == null || value === "") return "";
  if (typeof value !== "string") return "invalid";
  return value.trim();
}

export function readWorkExperience(raw: unknown): WorkExperienceItem[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  const parsed = parseWorkExperience(value ?? []);
  return parsed.ok ? parsed.items : [];
}
