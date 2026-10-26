import { useEffect, useRef } from "react";
import "../expert/availability-grid.css";
import { HOUR_PX, STEP, cellFromOffset, formatHm } from "../expert/availabilityMath";
import { type WeekDay } from "./bookingMath";
import { useBookingPointer } from "./useBookingPointer";

const LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface Props {
  days: WeekDay[];
  onBook: (iso: string, start: number, end: number) => void;
  onMove: (id: number, iso: string, start: number, end: number) => void;
}

export default function OpsBookingGrid({ days, onBook, onMove }: Props) {
  const { scrollRef, colRefs, drag, hover, setHover, preview, beginCreate, beginMove } = useBookingPointer(days, onBook, onMove);
  const daysRef = useRef(days);
  daysRef.current = days;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const nowMin = today.getHours() * 60 + today.getMinutes();
  const focus = days.map((day) => `${day.iso}:${day.open.map((range) => range.start).join(",")}`).join("|");
  const movingId = drag?.kind === "move" && preview ? drag.id : null;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = daysRef.current.flatMap((day) => day.open).sort((a, b) => a.start - b.start)[0];
    el.scrollTop = Math.max(0, (((first?.start ?? nowMin) - 60) / 60) * HOUR_PX);
  }, [focus, scrollRef]);

  return (
    <div className="avail" style={{ "--hour": `${HOUR_PX}px` } as React.CSSProperties}>
      <p className="avail-hint">在浅色区域按住拖动可约新课。拖动已约色块，可以改到别的可约时间。</p>
      <div className="avail-scroll" ref={scrollRef} data-testid="booking-grid">
        <div className="avail-head">
          <div />
          {days.map((day) => (
            <div key={day.iso} className={`avail-day${day.iso === todayIso ? " is-today" : ""}`}>
              <span>{LABELS[day.weekday]} {day.date.getMonth() + 1}/{day.date.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="avail-plane">
          <div className="avail-body">
            <div className="avail-hours">
              {HOURS.map((hour) => (
                <div key={hour} className="avail-hour" style={{ top: hour * HOUR_PX }}>
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.iso}
                className={`avail-col${day.iso === todayIso ? " is-today" : ""}${day.closed ? " is-closed" : ""}`}
                data-testid={`book-col-${day.iso}`}
                ref={(node) => { colRefs.current[day.iso] = node; }}
                onPointerDown={(e) => {
                  if (day.closed || e.button !== 0 || (e.target as HTMLElement).closest("[data-booked]")) return;
                  const cell = cellFromOffset(e.clientY - e.currentTarget.getBoundingClientRect().top);
                  const window = day.open.find((item) => cell >= item.start && cell < item.end);
                  if (!window) return;
                  beginCreate(day.iso, cell, window, day.booked);
                }}
                onPointerMove={(e) => {
                  if (drag || day.closed) return;
                  const cell = cellFromOffset(e.clientY - e.currentTarget.getBoundingClientRect().top);
                  const inside = day.open.some((item) => cell >= item.start && cell < item.end);
                  setHover(inside ? { iso: day.iso, cell } : null);
                }}
                onPointerLeave={() => setHover((item) => (item?.iso === day.iso ? null : item))}
              >
                {day.open.map((range) => (
                  <div key={`${range.start}-${range.end}`} className="avail-open" style={{ top: (range.start / 60) * HOUR_PX, height: ((range.end - range.start) / 60) * HOUR_PX }}>
                    <span>可约 {formatHm(range.start)}–{formatHm(range.end)}</span>
                  </div>
                ))}
                {hover?.iso === day.iso && !drag && (
                  <div className="avail-hover" style={{ top: (hover.cell / 60) * HOUR_PX, height: (STEP / 60) * HOUR_PX }} />
                )}
                {day.booked.map((range) => (
                  <div
                    key={range.id}
                    data-booked
                    className="avail-slot avail-booked"
                    style={{ top: (range.start / 60) * HOUR_PX, height: ((range.end - range.start) / 60) * HOUR_PX, opacity: movingId === range.id ? 0.35 : 1 }}
                    onPointerDown={(e) => {
                      if (range.locked || day.closed || e.button !== 0) return;
                      e.stopPropagation();
                      const cell = cellFromOffset(e.clientY - (colRefs.current[day.iso]?.getBoundingClientRect().top ?? 0));
                      beginMove(range.id, day.iso, range, cell);
                    }}
                  >
                    <span className="avail-slot-label">已约 {formatHm(range.start)}–{formatHm(range.end)}</span>
                  </div>
                ))}
                {preview?.iso === day.iso && (
                  <div className="avail-slot is-ghost" style={{ top: (preview.range.start / 60) * HOUR_PX, height: ((preview.range.end - preview.range.start) / 60) * HOUR_PX }}>
                    <span className="avail-slot-label">{formatHm(preview.range.start)}–{formatHm(preview.range.end)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {days.some((day) => day.iso === todayIso) && (
            <div className="avail-now" style={{ top: (nowMin / 60) * HOUR_PX }}>
              <span>{formatHm(nowMin)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
