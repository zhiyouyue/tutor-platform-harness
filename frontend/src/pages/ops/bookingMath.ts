import { mergeRanges, parseHm, type Range } from "../expert/availabilityMath";

export type { Range };

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

export interface OpenSlot {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface Blackout {
  startAt: string;
  endAt: string;
}

export interface BookedSpan {
  id: number;
  startAt: string;
  endAt: string;
  status?: string;
}

export interface PlacedBooking extends Range {
  id: number;
  locked: boolean;
}

export interface WeekDay {
  weekday: number;
  date: Date;
  iso: string;
  open: Range[];
  bookable: Range[];
  booked: PlacedBooking[];
  closed: boolean;
}

export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekDates(anchor: Date): Date[] {
  const monday = new Date(anchor);
  monday.setHours(12, 0, 0, 0);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
  return WEEKDAYS.map((weekday) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + (weekday === 0 ? 6 : weekday - 1));
    return date;
  });
}

export function shiftWeek(anchor: Date, delta: number): Date {
  const next = new Date(anchor);
  next.setDate(next.getDate() + delta * 7);
  return next;
}

export function weekLabel(anchor: Date): string {
  const days = weekDates(anchor);
  const first = days[0]!;
  const last = days[6]!;
  return `${first.getMonth() + 1}月${first.getDate()}日 – ${last.getMonth() + 1}月${last.getDate()}日`;
}

function parseStamp(value: string): Date {
  return new Date(value.includes("T") ? value : value.replace(" ", "T"));
}

export function coversDate(iso: string, blackouts: Blackout[]): boolean {
  const start = new Date(`${iso}T00:00:00`).getTime();
  const end = new Date(`${iso}T00:00:00`);
  end.setDate(end.getDate() + 1);
  return blackouts.some((item) => {
    const from = parseStamp(item.startAt).getTime();
    const to = parseStamp(item.endAt).getTime();
    return start < to && end.getTime() > from;
  });
}

function clockOnDate(iso: string, value: string): number | null {
  const date = parseStamp(value);
  if (Number.isNaN(date.getTime()) || isoDate(date) !== iso) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function nextIso(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return isoDate(date);
}

export function appointmentRangeOnDate(iso: string, startAt: string, endAt: string): Range | null {
  const start = clockOnDate(iso, startAt);
  if (start == null) return null;
  const end = clockOnDate(iso, endAt);
  if (end != null && end > start) return { start, end };
  if (clockOnDate(nextIso(iso), endAt) === 0) return { start, end: 24 * 60 };
  return null;
}

function clipFromNow(ranges: Range[], iso: string, now: Date): Range[] {
  if (iso !== isoDate(now)) return ranges;
  const snapped = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30;
  return ranges
    .map((range) => ({ start: Math.max(range.start, snapped), end: range.end }))
    .filter((range) => range.end - range.start >= 30);
}

export function buildWeekDays(
  anchor: Date,
  slots: OpenSlot[],
  blackouts: Blackout[],
  appointments: BookedSpan[],
  now = new Date(),
): WeekDay[] {
  const today = isoDate(now);
  return weekDates(anchor).map((date) => {
    const iso = isoDate(date);
    const closed = iso < today || coversDate(iso, blackouts);
    const bookable = closed ? [] : clipFromNow([{ start: 0, end: 24 * 60 }], iso, now);
    const open = closed
      ? []
      : clipFromNow(
          mergeRanges(
            slots
              .filter((slot) => Number(slot.weekday) === date.getDay())
              .map((slot) => ({ start: parseHm(slot.startTime), end: parseHm(slot.endTime) })),
          ),
          iso,
          now,
        );
    const booked = appointments.flatMap((item) => {
      if (item.status === "cancelled") return [];
      const range = appointmentRangeOnDate(iso, item.startAt, item.endAt);
      if (!range) return [];
      return [{ ...range, id: item.id, locked: item.status === "completed" || item.status === "incomplete" }];
    });
    return { weekday: date.getDay(), date, iso, open, bookable, booked, closed };
  });
}

/** 拖动从可排窗口内开始，结果夹在窗口内，并且不能压到已有课次。 */
export function clampCreate(
  window: Range,
  anchor: number,
  current: number,
  blocked: Range[],
  step = 30,
): Range | null {
  if (anchor < window.start || anchor >= window.end) return null;
  const start = Math.max(window.start, Math.min(anchor, current));
  const end = Math.min(window.end, Math.max(anchor, current) + step);
  if (end - start < step) return null;
  if (blocked.some((item) => start < item.end && end > item.start)) return null;
  return { start, end };
}

/** 保持课次时长，把整块挪到指针所在格，且必须完全落在可排窗口内。 */
export function placeMove(
  origin: Range,
  anchor: number,
  current: number,
  windows: Range[],
  blocked: Range[],
): Range | null {
  const duration = origin.end - origin.start;
  const start = origin.start + (current - anchor);
  const end = start + duration;
  if (duration < 30 || start < 0 || end > 24 * 60) return null;
  if (!windows.some((window) => start >= window.start && end <= window.end)) return null;
  if (blocked.some((item) => start < item.end && end > item.start)) return null;
  return { start, end };
}

export function rangeStartsInPast(iso: string, startMin: number, now = new Date()): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 0, startMin).getTime() < now.getTime();
}
