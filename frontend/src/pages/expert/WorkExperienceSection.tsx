import { useState } from "react";
import {
  updateMyExpertProfile,
  type ExpertProfile,
  type WorkExperienceItem,
} from "../../services/api";

type Draft = {
  key: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function blank(current: boolean): Draft {
  return { key: newKey(), company: "", title: "", startDate: "", endDate: "", current };
}

function toDraft(item: WorkExperienceItem): Draft {
  return {
    key: newKey(),
    company: item.company,
    title: item.title,
    startDate: item.startDate,
    endDate: item.endDate ?? "",
    current: !item.endDate,
  };
}

function formatPeriod(start: string, end: string | null) {
  const startLabel = start.replace("-", ".");
  return `${startLabel} – ${end ? end.replace("-", ".") : "至今"}`;
}

function validate(drafts: Draft[]): string | null {
  if (drafts.length > 20) return "工作经历最多 20 条";
  for (let i = 0; i < drafts.length; i += 1) {
    const row = drafts[i];
    const n = i + 1;
    if (!row.title.trim()) return `第 ${n} 条请填写职位`;
    if (!row.company.trim()) return `第 ${n} 条请填写公司`;
    if (row.company.trim().length > 80 || row.title.trim().length > 80) {
      return `第 ${n} 条公司或职位不能超过 80 个字`;
    }
    if (!MONTH.test(row.startDate)) return `第 ${n} 条请选择开始时间`;
    if (!row.current && !MONTH.test(row.endDate)) return `第 ${n} 条请选择结束时间，或勾选至今`;
    if (!row.current && row.endDate < row.startDate) return `第 ${n} 条结束时间不能早于开始时间`;
  }
  return null;
}

function toPayload(drafts: Draft[]): WorkExperienceItem[] {
  return drafts.map((row) => ({
    company: row.company.trim(),
    title: row.title.trim(),
    startDate: row.startDate,
    endDate: row.current ? null : row.endDate,
  }));
}

export default function WorkExperienceSection({
  items,
  ready,
  onSaved,
}: {
  items: WorkExperienceItem[] | null | undefined;
  ready: boolean;
  onSaved: (profile: ExpertProfile) => void;
}) {
  const saved = Array.isArray(items) ? items : [];
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    const next = saved.map(toDraft);
    setDrafts(next.length > 0 ? next : [blank(true)]);
    setError("");
    setEditing(true);
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function handleSave() {
    const message = validate(drafts);
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updateMyExpertProfile({ workExperience: toPayload(drafts) });
      if (!res.success) {
        setError(res.message || "保存失败");
        return;
      }
      onSaved(res.data);
      setEditing(false);
    } catch {
      setError("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>工作经历</div>
        {!editing && (
          <button type="button" className="ant-btn ant-btn-default" disabled={!ready} onClick={startEdit}>
            {saved.length > 0 ? "编辑" : "添加工作经历"}
          </button>
        )}
      </div>

      {!editing && saved.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>还没有工作经历。添加后会显示在个人资料里。</div>
      )}

      {!editing && saved.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {saved.map((item) => (
            <div key={`${item.company}-${item.title}-${item.startDate}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-surface-2)", borderRadius: 8, border: "1px solid var(--c-border)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-primary-bg)", color: "var(--c-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{item.company[0]}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{item.company} · {formatPeriod(item.startDate, item.endDate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {drafts.map((row, index) => (
            <div key={row.key} style={{ padding: 14, background: "var(--c-surface-2)", borderRadius: 8, border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>经历 {index + 1}</span>
                <button type="button" className="ant-btn ant-btn-text" style={{ color: "var(--c-danger)", fontSize: 12 }} onClick={() => setDrafts((prev) => prev.filter((item) => item.key !== row.key))}>删除</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--c-text-3)" }}>
                  职位
                  <input className="ant-input" value={row.title} maxLength={80} onChange={(e) => updateDraft(row.key, { title: e.target.value })} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--c-text-3)" }}>
                  公司
                  <input className="ant-input" value={row.company} maxLength={80} onChange={(e) => updateDraft(row.key, { company: e.target.value })} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--c-text-3)" }}>
                  开始时间
                  <input className="ant-input" type="month" value={row.startDate} onChange={(e) => updateDraft(row.key, { startDate: e.target.value })} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--c-text-3)" }}>
                  结束时间
                  <input className="ant-input" type="month" value={row.current ? "" : row.endDate} disabled={row.current} onChange={(e) => updateDraft(row.key, { endDate: e.target.value, current: false })} />
                </label>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={row.current} onChange={(e) => updateDraft(row.key, { current: e.target.checked, endDate: e.target.checked ? "" : row.endDate })} />
                至今
              </label>
            </div>
          ))}

          {error && <div style={{ fontSize: 13, color: "#B91C1C" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="ant-btn ant-btn-default" onClick={() => setDrafts((prev) => [...prev, blank(prev.every((row) => !row.current))])}>添加一条</button>
            <button type="button" className="ant-btn ant-btn-primary" disabled={saving} onClick={handleSave}>{saving ? "保存中…" : "保存"}</button>
            <button type="button" className="ant-btn ant-btn-text" disabled={saving} onClick={() => { setEditing(false); setError(""); }}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
