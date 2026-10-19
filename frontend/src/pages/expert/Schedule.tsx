import { useEffect, useState } from "react";
import {
  addScheduleBlackout,
  expertCompleteAppointment,
  fetchExpertAppointments,
  fetchMyExpertProfile,
  fetchMySchedule,
  saveMySchedule,
  updateMyExpertProfile,
} from "../../services/api";

const DAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type SlotMap = Record<number, Array<{ startTime: string; endTime: string }>>;

function emptySlots(): SlotMap {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export default function Schedule() {
  const [slots, setSlots] = useState<SlotMap>(emptySlots());
  const [blackouts, setBlackouts] = useState<Array<{ id: number; startAt: string; endAt: string; reason: string | null }>>([]);
  const [upcoming, setUpcoming] = useState<Array<Record<string, unknown>>>([]);
  const [accepting, setAccepting] = useState(true);
  const [showBlock, setShowBlock] = useState(false);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [scheduleRes, apptRes, profileRes] = await Promise.all([
      fetchMySchedule(),
      fetchExpertAppointments(),
      fetchMyExpertProfile(),
    ]);
    if (scheduleRes.success) {
      const map = emptySlots();
      for (const s of scheduleRes.data.slots) {
        map[s.weekday] = map[s.weekday] || [];
        map[s.weekday].push({ startTime: s.startTime, endTime: s.endTime });
      }
      setSlots(map);
      setBlackouts(scheduleRes.data.blackouts);
    }
    if (apptRes.success) setUpcoming(apptRes.data.items);
    if (profileRes.success) setAccepting(profileRes.data.acceptingProjects);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function persistSlots(next: SlotMap) {
    setSaving(true);
    const flat = Object.entries(next).flatMap(([weekday, list]) =>
      list.map((s) => ({ weekday: Number(weekday), startTime: s.startTime, endTime: s.endTime })),
    );
    await saveMySchedule(flat);
    setSaving(false);
  }

  async function toggleAccepting() {
    const next = !accepting;
    setAccepting(next);
    await updateMyExpertProfile({ acceptingProjects: next });
  }

  async function addSlot(weekday: number) {
    const startTime = prompt("开始时间 (HH:mm)", "19:00");
    const endTime = prompt("结束时间 (HH:mm)", "22:00");
    if (!startTime || !endTime) return;
    const next = { ...slots, [weekday]: [...(slots[weekday] || []), { startTime, endTime }] };
    setSlots(next);
    await persistSlots(next);
  }

  async function removeSlot(weekday: number, index: number) {
    const next = { ...slots, [weekday]: slots[weekday].filter((_, i) => i !== index) };
    setSlots(next);
    await persistSlots(next);
  }

  async function submitBlackout() {
    if (!blockStart || !blockEnd) return;
    await addScheduleBlackout({
      startAt: `${blockStart} 00:00:00`,
      endAt: `${blockEnd} 23:59:59`,
      reason: blockReason || undefined,
    });
    setShowBlock(false);
    setBlockStart("");
    setBlockEnd("");
    setBlockReason("");
    load();
  }

  if (loading) {
    return <div style={{ padding: 24, color: "var(--c-text-3)" }}>加载中…</div>;
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>我的时间</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>
          设置可辅导时间，运营将据此安排预约 {saving ? "· 保存中…" : ""}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{accepting ? "🟢 可接受项目" : "⚪ 暂停接受项目"}</div>
          <div style={{ fontSize: 12, color: "var(--c-text-3)" }}>{accepting ? "当前可接受新的学员预约" : "暂时不接受新学员"}</div>
        </div>
        <button
          onClick={toggleAccepting}
          style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: accepting ? "var(--c-success)" : "var(--c-border-2)", position: "relative" }}
        >
          <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 3, left: accepting ? "calc(100% - 21px)" : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 15 }}>每周可辅导时间</div>
          <div style={{ padding: "8px 0" }}>
            {WEEKDAY_ORDER.map((weekday) => (
              <div key={weekday} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", borderBottom: "1px solid var(--c-border)" }}>
                <div style={{ width: 36, fontSize: 13, fontWeight: 500, color: "var(--c-text-2)", flexShrink: 0 }}>{DAY_LABELS[weekday]}</div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(slots[weekday] || []).length === 0 ? (
                    <span style={{ fontSize: 12, color: "var(--c-text-4)", fontStyle: "italic" }}>暂不可用</span>
                  ) : (slots[weekday] || []).map((s, idx) => (
                    <div key={`${s.startTime}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "var(--c-primary-bg)", border: "1px solid #91CAFF", borderRadius: 4, fontSize: 12, color: "var(--c-primary)" }}>
                      {s.startTime}–{s.endTime}
                      <button onClick={() => removeSlot(weekday, idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#91CAFF", padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                    </div>
                  ))}
                </div>
                <button className="ant-btn ant-btn-default" style={{ padding: "3px 10px", fontSize: 12 }} onClick={() => addSlot(weekday)}>添加</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>临时不可用</span>
              <button className="ant-btn ant-btn-text" style={{ fontSize: 12, color: "var(--c-primary)" }} onClick={() => setShowBlock(v => !v)}>添加</button>
            </div>
            {showBlock && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>开始日期</div><input type="date" className="ant-input" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} /></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>结束日期</div><input type="date" className="ant-input" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} /></div>
                <div><div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>原因（可选）</div><input className="ant-input" placeholder="如：出差、休假" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} /></div>
                <button className="ant-btn ant-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submitBlackout}>确认</button>
              </div>
            )}
            {!showBlock && (
              <div style={{ padding: "8px 0" }}>
                {blackouts.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: "var(--c-text-4)" }}>暂无临时不可用时段</div>
                ) : blackouts.map((b) => (
                  <div key={b.id} style={{ padding: "10px 20px", fontSize: 13, borderBottom: "1px solid var(--c-border)" }}>
                    {new Date(b.startAt).toLocaleDateString()} – {new Date(b.endAt).toLocaleDateString()}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: 14 }}>近期辅导安排</div>
            <div style={{ padding: "8px 0" }}>
              {upcoming.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--c-text-3)" }}>暂无预约</div>
              ) : upcoming.map((s) => (
                <div key={s.id as number} style={{ padding: "10px 20px", borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{(s.studentName as string) || "学员"} · {(s.topic as string) || (s.projectTitle as string)}</div>
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "#F6FFED", color: "var(--c-success)" }}>
                      {STATUS_LABEL[s.status as string] || s.status as string}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 3 }}>
                    {new Date(s.startAt as string).toLocaleString("zh-CN")}
                  </div>
                  {typeof s.meetingUrl === "string" && s.meetingUrl && (
                    <a href={s.meetingUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--c-primary)", display: "inline-block", marginTop: 6 }}>
                      进入会议
                    </a>
                  )}
                  {!Boolean(s.expertCompletedAt) && (
                    <button
                      className="ant-btn ant-btn-default"
                      style={{ marginTop: 8, fontSize: 12 }}
                      onClick={async () => {
                        await expertCompleteAppointment(s.projectId as number, s.id as number);
                        await load();
                      }}
                    >
                      标记课次完成
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
