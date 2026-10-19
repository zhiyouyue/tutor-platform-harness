import { AppError } from "../errors/AppError.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":");
  return parseInt(h ?? "0", 10) * 60 + parseInt(m ?? "0", 10);
}

function parseLocalDateTime(value: string): Date {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) throw new AppError("时间格式无效", 400);
  return d;
}

export async function assertAppointmentInExpertSchedule(
  expertId: number,
  startAt: string,
  endAt: string,
): Promise<void> {
  const start = parseLocalDateTime(startAt);
  const end = parseLocalDateTime(endAt);
  if (end <= start) throw new AppError("结束时间须晚于开始时间", 400);

  const weekday = start.getDay();
  const slots = await scheduleRepo.listSlots(expertId);
  const daySlots = slots.filter((s) => s.weekday === weekday);
  if (daySlots.length === 0) {
    throw new AppError("该日期不在专家开放日程内", 400);
  }

  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const inSlot = daySlots.some((s) => {
    const sm = timeToMinutes(String(s.start_time).slice(0, 5));
    const em = timeToMinutes(String(s.end_time).slice(0, 5));
    return startMin >= sm && endMin <= em;
  });
  if (!inSlot) throw new AppError("课次时间须落在专家开放时段内", 400);

  const blackouts = await scheduleRepo.listBlackouts(expertId);
  for (const b of blackouts) {
    const bs = new Date(b.start_at).getTime();
    const be = new Date(b.end_at).getTime();
    if (start.getTime() < be && end.getTime() > bs) {
      throw new AppError("该时段专家不可用", 400);
    }
  }
}
