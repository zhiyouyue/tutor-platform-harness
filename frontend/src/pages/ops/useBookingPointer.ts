import { useEffect, useRef, useState } from "react";
import { cellFromOffset } from "../expert/availabilityMath";
import { clampCreate, placeMove, type Range, type WeekDay } from "./bookingMath";

export type BookingDrag =
  | { kind: "create"; iso: string; anchor: number; current: number; window: Range; blocked: Range[] }
  | { kind: "move"; id: number; fromIso: string; targetIso: string; origin: Range; anchor: number; current: number };

export interface DragPreview {
  iso: string;
  range: Range;
}

function columnAt(x: number, cols: Record<string, HTMLDivElement | null>, fallback: string): string {
  for (const [iso, el] of Object.entries(cols)) {
    if (!el) continue;
    const box = el.getBoundingClientRect();
    if (x >= box.left && x <= box.right) return iso;
  }
  return fallback;
}

function previewOf(drag: BookingDrag, days: WeekDay[]): DragPreview | null {
  if (drag.kind === "create") {
    const range = clampCreate(drag.window, drag.anchor, drag.current, drag.blocked);
    return range ? { iso: drag.iso, range } : null;
  }
  const day = days.find((item) => item.iso === drag.targetIso);
  if (!day) return null;
  const blocked = day.booked.filter((item) => item.id !== drag.id);
  const range = placeMove(drag.origin, drag.anchor, drag.current, day.open, blocked);
  return range ? { iso: drag.targetIso, range } : null;
}

export function useBookingPointer(
  days: WeekDay[],
  onCreate: (iso: string, start: number, end: number) => void,
  onMove: (id: number, iso: string, start: number, end: number) => void,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragRef = useRef<BookingDrag | null>(null);
  const daysRef = useRef(days);
  const onCreateRef = useRef(onCreate);
  const onMoveRef = useRef(onMove);
  daysRef.current = days;
  onCreateRef.current = onCreate;
  onMoveRef.current = onMove;
  const [drag, setDrag] = useState<BookingDrag | null>(null);
  const [hover, setHover] = useState<{ iso: string; cell: number } | null>(null);

  useEffect(() => {
    function onMovePointer(e: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;
      const scroller = scrollRef.current;
      if (scroller) {
        const box = scroller.getBoundingClientRect();
        if (e.clientY > box.bottom - 36) scroller.scrollTop += 14;
        else if (e.clientY < box.top + 48) scroller.scrollTop -= 14;
      }
      const iso = current.kind === "move" ? columnAt(e.clientX, colRefs.current, current.targetIso) : current.iso;
      const col = colRefs.current[iso];
      if (!col) return;
      const cell = cellFromOffset(e.clientY - col.getBoundingClientRect().top);
      const next = current.kind === "move"
        ? { ...current, targetIso: iso, current: cell }
        : { ...current, current: cell };
      const prevIso = current.kind === "move" ? current.targetIso : current.iso;
      if (next.current === current.current && iso === prevIso) return;
      dragRef.current = next;
      setDrag(next);
    }
    function onUp() {
      const current = dragRef.current;
      if (!current) return;
      dragRef.current = null;
      setDrag(null);
      const picked = previewOf(current, daysRef.current);
      if (!picked) return;
      if (current.kind === "create") {
        onCreateRef.current(picked.iso, picked.range.start, picked.range.end);
        return;
      }
      if (picked.iso === current.fromIso && picked.range.start === current.origin.start) return;
      onMoveRef.current(current.id, picked.iso, picked.range.start, picked.range.end);
    }
    window.addEventListener("pointermove", onMovePointer);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMovePointer);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  function begin(next: BookingDrag) {
    dragRef.current = next;
    setDrag(next);
    setHover(null);
  }

  return {
    scrollRef,
    colRefs,
    drag,
    hover,
    setHover,
    preview: drag ? previewOf(drag, days) : null,
    beginCreate(iso: string, cell: number, window: Range, blocked: Range[]) {
      begin({ kind: "create", iso, anchor: cell, current: cell, window, blocked });
    },
    beginMove(id: number, iso: string, origin: Range, cell: number) {
      begin({ kind: "move", id, fromIso: iso, targetIso: iso, origin, anchor: cell, current: cell });
    },
  };
}
