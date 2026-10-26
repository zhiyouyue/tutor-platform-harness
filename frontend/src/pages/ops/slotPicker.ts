export interface OpenSlot {
  weekday: number;
  startTime: string;
  endTime: string;
}

export const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const STEP = 30;
const DAY = 24 * 60;

export function toMinutes(value: string): number {
  const [h, m] = value.split(":");
  const hh = Number(h);
  const mm = Number(m ?? 0);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  if (hh === 24 && mm === 0) return DAY;
  return hh * 60 + mm;
}

export function formatMinutes(min: number): string {
  if (min === DAY) return "24:00";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function weekdayOfDate(isoDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const day = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(day.getTime())) return null;
  return day.getDay();
}

export function slotKey(slot: OpenSlot): string {
  return `${slot.weekday}-${slot.startTime}-${slot.endTime}`;
}

export function slotsForDate(slots: OpenSlot[], isoDate: string): OpenSlot[] {
  const weekday = weekdayOfDate(isoDate);
  if (weekday == null) return [];
  return slots.filter((slot) => Number(slot.weekday) === weekday);
}

export function startOptions(slot: OpenSlot, step = STEP): string[] {
  const start = toMinutes(slot.startTime);
  const end = toMinutes(slot.endTime);
  const out: string[] = [];
  for (let t = start; t + step <= end; t += step) out.push(formatMinutes(t));
  return out;
}

export function endOptions(slot: OpenSlot, startHm: string, step = STEP): string[] {
  const start = toMinutes(startHm);
  const end = toMinutes(slot.endTime);
  const out: string[] = [];
  for (let t = start + step; t <= end; t += step) out.push(formatMinutes(t));
  return out;
}

export function defaultClassTimes(slot: OpenSlot | undefined): { start: string; end: string } {
  if (!slot) return { start: "", end: "" };
  const starts = startOptions(slot);
  const start = starts[0] ?? "";
  const ends = start ? endOptions(slot, start) : [];
  const hour = ends.find((item) => toMinutes(item) - toMinutes(start) === 60);
  return { start, end: hour ?? ends[0] ?? "" };
}

export function formatClock(value: string): string {
  return formatMinutes(toMinutes(value));
}

export function summarizeSlots(slots: OpenSlot[]): string {
  return [...slots]
    .sort((a, b) => a.weekday - b.weekday || toMinutes(a.startTime) - toMinutes(b.startTime))
    .map((slot) => `${WEEKDAY_LABELS[slot.weekday]} ${formatClock(slot.startTime)}–${formatClock(slot.endTime)}`)
    .join("、");
}

/** MySQL DATETIME 不接受 24:00:00，当日结束写成次日 00:00:00。 */
export function toDateTime(isoDate: string, hm: string): string {
  if (toMinutes(hm) === DAY) {
    const next = new Date(`${isoDate}T12:00:00`);
    next.setDate(next.getDate() + 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    const d = String(next.getDate()).padStart(2, "0");
    return `${y}-${m}-${d} 00:00:00`;
  }
  return `${isoDate} ${formatMinutes(toMinutes(hm))}:00`;
}
