import { useCallback, useEffect, useState } from "react";
import { createStudent, fetchStudents, sendStudentLoginLink, type Student } from "../../services/api";

export default function Students() {
  const [items, setItems] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ realName: "", phone: "", school: "", major: "", targetRole: "" });
  const [linkMsg, setLinkMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetchStudents();
    if (res.success) setItems(res.data.items);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    const res = await createStudent(form);
    if (res.success) {
      setShowAdd(false);
      setForm({ realName: "", phone: "", school: "", major: "", targetRole: "" });
      await load();
    } else alert(res.message);
  }

  async function handleLoginLink(id: number) {
    const res = await sendStudentLoginLink(id);
    if (res.success) setLinkMsg(`登录 token: ${res.data.token}（7天有效）`);
    else alert(res.message);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>学员管理</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>共 {items.length} 名学员</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={() => setShowAdd(!showAdd)}>新增学员</button>
      </div>
      {linkMsg && <div style={{ fontSize: 12, color: "var(--c-primary)", wordBreak: "break-all" }}>{linkMsg}</div>}
      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
          {[["realName", "姓名"], ["phone", "手机号"], ["school", "学校"], ["major", "专业"], ["targetRole", "目标岗位"]].map(([k, l]) => (
            <input key={k} className="ant-input" placeholder={l} value={form[k as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>创建</button>
        </div>
      )}
      {items.map((s) => (
        <div key={s.id} style={{ background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600 }}>{s.realName}</div>
            <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>{s.phone} · {s.city || "—"}</div>
          </div>
          <button className="ant-btn ant-btn-default" onClick={() => handleLoginLink(s.id)}>生成登录链接</button>
        </div>
      ))}
    </div>
  );
}
