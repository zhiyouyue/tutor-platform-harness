import { useEffect, useState } from "react";
import { createOpsAppointmentFromSlot, fetchExpertScheduleSlots, rescheduleOpsAppointment } from "../../services/api";
import { formatHm } from "../expert/availabilityMath";
import { buildWeekDays, rangeStartsInPast, shiftWeek, weekLabel, type Blackout, type BookedSpan, type OpenSlot } from "./bookingMath";
import OpsBookingGrid from "./OpsBookingGrid";
import { toDateTime } from "./slotPicker";

interface Props {
  projectId: number;
  expertId: number;
  appointments: BookedSpan[];
  focusIso?: string;
  onBooked: () => Promise<void>;
}

function cursorFrom(focusIso?: string): Date {
  if (!focusIso) return new Date();
  const date = new Date(`${focusIso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default function OpsBookingBoard({ projectId, expertId, appointments, focusIso, onBooked }: Props) {
  const [cursor, setCursor] = useState(() => cursorFrom(focusIso));
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCursor(cursorFrom(focusIso));
  }, [focusIso]);

  useEffect(() => {
    let alive = true;
    fetchExpertScheduleSlots(expertId).then((res) => {
      if (!alive) return;
      if (!res.success) {
        setNotice(res.message || "读取专家时间失败");
        return;
      }
      setSlots(res.data.items);
      setBlackouts(res.data.blackouts);
      if (!res.data.items.length) setNotice("导师还没有开放时间。浅色为空时，仍可在空白处排课。");
    });
    return () => { alive = false; };
  }, [expertId]);

  const days = buildWeekDays(cursor, slots, blackouts, appointments);

  async function save(run: () => Promise<{ success: boolean; message: string }>) {
    if (saving) return;
    setSaving(true);
    setNotice("");
    const res = await run();
    setSaving(false);
    if (!res.success) {
      setNotice(res.message);
      return;
    }
    await onBooked();
  }

  function book(iso: string, start: number, end: number) {
    if (rangeStartsInPast(iso, start)) {
      setNotice("不能约已经过去的时间");
      return;
    }
    void save(() => createOpsAppointmentFromSlot(projectId, {
      startAt: toDateTime(iso, formatHm(start)),
      endAt: toDateTime(iso, formatHm(end)),
    }));
  }

  function move(id: number, iso: string, start: number, end: number) {
    if (rangeStartsInPast(iso, start)) {
      setNotice("不能改到已经过去的时间");
      return;
    }
    void save(() => rescheduleOpsAppointment(id, toDateTime(iso, formatHm(start)), toDateTime(iso, formatHm(end))));
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 0" }}>
        <div style={{ fontWeight: 600 }}>排课</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" className="ant-btn ant-btn-default" onClick={() => setCursor(shiftWeek(cursor, -1))}>上一周</button>
          <span style={{ fontSize: 13, minWidth: 140, textAlign: "center" }}>{weekLabel(cursor)}</span>
          <button type="button" className="ant-btn ant-btn-default" onClick={() => setCursor(new Date())}>本周</button>
          <button type="button" className="ant-btn ant-btn-default" onClick={() => setCursor(shiftWeek(cursor, 1))}>下一周</button>
        </div>
      </div>
      {notice && <p style={{ margin: "8px 16px 0", fontSize: 13, color: "var(--c-warning)" }}>{notice}</p>}
      {saving && <p style={{ margin: "8px 16px 0", fontSize: 13, color: "var(--c-text-3)" }}>正在保存…</p>}
      <OpsBookingGrid days={days} onBook={book} onMove={move} />
    </div>
  );
}
