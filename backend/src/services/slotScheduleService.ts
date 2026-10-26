import { AppError } from "../errors/AppError.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import { clockMinutes, minutesFromStartDay, normalizeSqlDateTime } from "./slotTime.js";

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
  const start = parseLocalDateTime(normalizeSqlDateTime(startAt));
  const end = parseLocalDateTime(normalizeSqlDateTime(endAt));
  if (end <= start) throw new AppError("结束时间须晚于开始时间", 400);

  const weekday = start.getDay();
  const slots = await scheduleRepo.listSlots(expertId);
  const daySlots = slots.filter((s) => Number(s.weekday) === weekday);
  if (daySlots.length === 0) {
    throw new AppError("该日期不在专家开放日程内", 400);
  }

  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = minutesFromStartDay(start, end);
  const inSlot = daySlots.some((s) => {
    const sm = clockMinutes(String(s.start_time));
    const em = clockMinutes(String(s.end_time));
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
