import { useEffect, useRef, useState } from "react";
import "./availability-grid.css";
import {
  HOUR_PX,
  STEP,
  applyDrag,
  cellFromOffset,
  formatHm,
  paintRanges,
  rangesEqual,
  toRanges,
  toSlotTimes,
  type DragOp,
  type SlotTime,
} from "./availabilityMath";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
const LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface Props {
  slots: Record<number, SlotTime[]>;
  onChange: (weekday: number, next: SlotTime[]) => void;
}

type Drag = DragOp & { weekday: number };

export default function WeeklyAvailabilityGrid({ slots, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const dragRef = useRef<Drag | null>(null);
  const slotsRef = useRef(slots);
  const onChangeRef = useRef(onChange);
  slotsRef.current = slots;
  onChangeRef.current = onChange;

  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<{ weekday: number; cell: number } | null>(null);
  const today = new Date().getDay();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const mins = new Date().getHours() * 60 + new Date().getMinutes();
    el.scrollTop = Math.max(0, ((mins - 90) / 60) * HOUR_PX);
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;
      const col = colRefs.current[current.weekday];
      const scroller = scrollRef.current;
      if (scroller) {
        const box = scroller.getBoundingClientRect();
        if (e.clientY > box.bottom - 36) scroller.scrollTop += 14;
        else if (e.clientY < box.top + 48) scroller.scrollTop -= 14;
      }
      if (!col) return;
      const cell = cellFromOffset(e.clientY - col.getBoundingClientRect().top);
      if (cell === current.current) return;
      const next = { ...current, current: cell };
      dragRef.current = next;
      setDrag(next);
    }
    function onUp() {
      const current = dragRef.current;
      if (!current) return;
      dragRef.current = null;
      setDrag(null);
      const prev = toRanges(slotsRef.current[current.weekday] ?? []);
      const next = applyDrag(prev, current);
      if (rangesEqual(prev, next)) return;
      onChangeRef.current(current.weekday, toSlotTimes(next));
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  function begin(weekday: number, op: DragOp) {
    const next = { ...op, weekday };
    dragRef.current = next;
    setDrag(next);
    setHover(null);
  }

  function removeSlot(weekday: number, index: number) {
    const next = toRanges(slots[weekday] ?? []).filter((_, i) => i !== index);
    onChange(weekday, toSlotTimes(next));
  }

  return (
    <div className="avail" style={{ "--hour": `${HOUR_PX}px` } as React.CSSProperties}>
      <p className="avail-hint">在当天这一列按住并上下拖动，框选可上课时间。拖动色块可平移，拖动上下边缘可调整，点 × 删除。相邻时段会自动合并。</p>
      <div className="avail-scroll" ref={scrollRef} data-testid="availability-grid">
        <div className="avail-head">
          <div />
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className={`avail-day${weekday === today ? " is-today" : ""}`}>
              <span>{LABELS[weekday]}</span>
            </div>
          ))}
        </div>
        <div className="avail-plane">
        <div className="avail-body">
          <div className="avail-hours">
            {HOURS.map((hour) => (
              Math.abs(hour * 60 - nowMin) < 18 ? null : (
                <div key={hour} className="avail-hour" style={{ top: hour * HOUR_PX }}>
                  {String(hour).padStart(2, "0")}:00
                </div>
              )
            ))}
          </div>
          {WEEKDAYS.map((weekday) => {
            const ranges = paintRanges(toRanges(slots[weekday] ?? []), drag?.weekday === weekday ? drag : null);
            return (
              <div
                key={weekday}
                className={`avail-col${weekday === today ? " is-today" : ""}`}
                data-testid={`avail-col-${weekday}`}
                ref={(node) => { colRefs.current[weekday] = node; }}
                onPointerDown={(e) => {
                  if (e.button !== 0 || (e.target as HTMLElement).closest("[data-slot]")) return;
                  const cell = cellFromOffset(e.clientY - e.currentTarget.getBoundingClientRect().top);
                  begin(weekday, { kind: "create", anchor: cell, current: cell });
                }}
                onPointerMove={(e) => {
                  if (dragRef.current) return;
                  if ((e.target as HTMLElement).closest("[data-slot]")) {
                    setHover(null);
                    return;
                  }
                  const cell = cellFromOffset(e.clientY - e.currentTarget.getBoundingClientRect().top);
                  setHover({ weekday, cell });
                }}
                onPointerLeave={() => setHover((h) => (h?.weekday === weekday ? null : h))}
              >
                {hover?.weekday === weekday && !drag && (
                  <div className="avail-hover" style={{ top: (hover.cell / 60) * HOUR_PX, height: (STEP / 60) * HOUR_PX }} />
                )}
                {ranges.map((range) => (
                  <div
                    key={`${range.index}-${range.start}-${range.end}`}
                    data-slot
                    className={`avail-slot${range.ghost ? " is-ghost" : ""}`}
                    style={{ top: (range.start / 60) * HOUR_PX, height: ((range.end - range.start) / 60) * HOUR_PX }}
                    onPointerDown={(e) => {
                      if (range.ghost || e.button !== 0) return;
                      e.stopPropagation();
                      const cell = cellFromOffset(e.clientY - (colRefs.current[weekday]?.getBoundingClientRect().top ?? 0));
                      begin(weekday, { kind: "move", index: range.index, anchor: cell, origin: range, current: cell });
                    }}
                  >
                    <span className="avail-slot-label">{formatHm(range.start)}–{formatHm(range.end)}</span>
                    <button
                      type="button"
                      className="avail-remove"
                      aria-label={`删除${LABELS[weekday]} ${formatHm(range.start)}到${formatHm(range.end)}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeSlot(weekday, range.index)}
                    >
                      ×
                    </button>
                    {(["start", "end"] as const).map((edge) => (
                      <div
                        key={edge}
                        className={`avail-handle avail-handle-${edge}`}
                        onPointerDown={(e) => {
                          if (range.ghost || e.button !== 0) return;
                          e.stopPropagation();
                          const cell = cellFromOffset(e.clientY - (colRefs.current[weekday]?.getBoundingClientRect().top ?? 0));
                          begin(weekday, { kind: "resize", index: range.index, edge, origin: range, current: cell });
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="avail-now" style={{ top: (nowMin / 60) * HOUR_PX }}>
          <span>{formatHm(nowMin)}</span>
        </div>
        </div>
      </div>
    </div>
  );
}
