export const STEP = 30;
export const DAY_MINUTES = 24 * 60;
export const HOUR_PX = 48;

export interface Range {
  start: number;
  end: number;
}

export interface SlotTime {
  startTime: string;
  endTime: string;
}

export type DragOp =
  | { kind: "create"; anchor: number; current: number }
  | { kind: "move"; index: number; anchor: number; origin: Range; current: number }
  | { kind: "resize"; index: number; edge: "start" | "end"; origin: Range; current: number };

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function parseHm(value: string): number {
  const [h, m] = value.split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  return clamp(hh * 60 + mm, 0, DAY_MINUTES);
}

export function formatHm(min: number): string {
  const clamped = clamp(min, 0, DAY_MINUTES);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 指针所在的 30 分钟格起点。 */
export function cellFromOffset(offsetY: number, hourPx = HOUR_PX): number {
  const raw = (offsetY / hourPx) * 60;
  const snapped = Math.floor(raw / STEP) * STEP;
  return clamp(snapped, 0, DAY_MINUTES - STEP);
}

export function mergeRanges(ranges: Range[]): Range[] {
  const sorted = ranges
    .filter((r) => r.end > r.start)
    .map((r) => ({ start: r.start, end: r.end }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (!last || r.start > last.end) out.push({ start: r.start, end: r.end });
    else last.end = Math.max(last.end, r.end);
  }
  return out;
}

export function liveRange(drag: DragOp): Range {
  if (drag.kind === "create") {
    const start = Math.min(drag.anchor, drag.current);
    const end = Math.max(drag.anchor, drag.current) + STEP;
    return { start, end: Math.min(DAY_MINUTES, end) };
  }
  if (drag.kind === "move") {
    const duration = drag.origin.end - drag.origin.start;
    const start = clamp(drag.origin.start + (drag.current - drag.anchor), 0, DAY_MINUTES - duration);
    return { start, end: start + duration };
  }
  if (drag.edge === "start") {
    return { start: clamp(drag.current, 0, drag.origin.end - STEP), end: drag.origin.end };
  }
  return {
    start: drag.origin.start,
    end: clamp(drag.current + STEP, drag.origin.start + STEP, DAY_MINUTES),
  };
}

export function applyDrag(ranges: Range[], drag: DragOp): Range[] {
  const live = liveRange(drag);
  if (drag.kind === "create") return mergeRanges([...ranges, live]);
  return mergeRanges(ranges.map((r, i) => (i === drag.index ? live : r)));
}

export function rangesEqual(a: Range[], b: Range[]): boolean {
  return a.length === b.length && a.every((r, i) => r.start === b[i].start && r.end === b[i].end);
}

export function toRanges(slots: SlotTime[]): Range[] {
  return mergeRanges(slots.map((s) => ({ start: parseHm(s.startTime), end: parseHm(s.endTime) })));
}

export function toSlotTimes(ranges: Range[]): SlotTime[] {
  return ranges.map((r) => ({ startTime: formatHm(r.start), endTime: formatHm(r.end) }));
}

export interface PaintedRange extends Range {
  index: number;
  ghost: boolean;
}

export function paintRanges(ranges: Range[], drag: DragOp | null): PaintedRange[] {
  const tagged = ranges.map((range, index) => ({ ...range, index, ghost: false }));
  if (!drag) return tagged;
  const live = liveRange(drag);
  if (drag.kind === "create") return [...tagged, { ...live, index: -1, ghost: true }];
  return tagged.map((range) => (range.index === drag.index ? { ...live, index: range.index, ghost: true } : range));
}
