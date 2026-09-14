import { useCallback, useEffect, useState } from "react";
import {
  confirmProjectCompletion,
  createProject,
  fetchAllDictionaries,
  fetchOpsExperts,
  fetchOpsProjects,
  fetchStudents,
  publishProject,
  type DictItem,
  type Project,
  type Student,
} from "../../services/api";

export default function SupervisorProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [experts, setExperts] = useState<Array<{ id: number; realName: string | null }>>([]);
  const [coachingTypes, setCoachingTypes] = useState<DictItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    studentId: "",
    expertId: "",
    totalAmount: "",
    coachingTypes: [] as string[],
  });

  const load = useCallback(async () => {
    const [p, s, e, d] = await Promise.all([
      fetchOpsProjects(),
      fetchStudents(),
      fetchOpsExperts(),
      fetchAllDictionaries(),
    ]);
    if (p.success) setItems(p.data.items);
    if (s.success) setStudents(s.data.items);
    if (e.success) setExperts(e.data.items);
    if (d.success) setCoachingTypes(d.data.coachingTypes);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    const res = await createProject({
      title: form.title,
      studentId: Number(form.studentId),
      expertId: form.expertId ? Number(form.expertId) : undefined,
      totalAmount: Number(form.totalAmount) || 0,
      coachingTypes: form.coachingTypes,
    });
    if (res.success) {
      setShowCreate(false);
      await load();
    } else alert(res.message);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>项目管理</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>共 {items.length} 个项目</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={() => setShowCreate(!showCreate)}>创建项目</button>
      </div>
      {showCreate && (
        <div style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
          <input className="ant-input" placeholder="项目标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="ant-select" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">选择学员</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.realName} ({s.phone})</option>)}
          </select>
          <select className="ant-select" value={form.expertId} onChange={(e) => setForm({ ...form, expertId: e.target.value })}>
            <option value="">指定专家</option>
            {experts.map((e) => <option key={e.id} value={e.id}>{e.realName || `专家#${e.id}`}</option>)}
          </select>
          <input className="ant-input" type="number" placeholder="总价" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {coachingTypes.map((c) => (
              <button key={c.code} type="button" onClick={() => setForm({
                ...form,
                coachingTypes: form.coachingTypes.includes(c.code)
                  ? form.coachingTypes.filter((x) => x !== c.code)
                  : [...form.coachingTypes, c.code],
              })} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid var(--c-border)", background: form.coachingTypes.includes(c.code) ? "var(--c-primary-bg)" : "#fff" }}>
                {c.label}
              </button>
            ))}
          </div>
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>创建</button>
        </div>
      )}
      {items.map((p) => (
        <div key={p.id} style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600 }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
            {p.studentName} · {p.expertName || "待指定"} · ¥{p.totalAmount} · {p.status}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            {p.status === "draft" && (
              <button className="ant-btn ant-btn-primary" onClick={async () => { await publishProject(p.id); await load(); }}>发布给专家</button>
            )}
            {p.status === "pending_completion_review" && (
              <button className="ant-btn ant-btn-primary" onClick={async () => { await confirmProjectCompletion(p.id); await load(); }}>确认完成并入账</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
