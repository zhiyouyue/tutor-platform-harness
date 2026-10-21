import { useCallback, useEffect, useState } from "react";
import { createStudent, fetchStudents, importStudents, sendStudentLoginLink, type Student } from "../../services/api";
import { PrimaryButton, SimpleCard, SimpleScreen } from "../../components/SimpleScreen";

export default function Students() {
  const [items, setItems] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ realName: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [loginToken, setLoginToken] = useState("");

  const load = useCallback(async () => {
    const res = await fetchStudents();
    if (res.success) setItems(res.data.items);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    const res = await createStudent(form);
    if (res.success) {
      setShowAdd(false);
      setForm({ realName: "", phone: "" });
      setMsg("已添加");
      await load();
    } else setMsg(res.message);
  }

  async function handleLoginLink(id: number) {
    const res = await sendStudentLoginLink(id);
    if (res.success && res.data.token) {
      setLoginToken(res.data.token);
      setMsg("登录口令已生成。请复制后发给学员，在学员登录页选择「口令登录」粘贴。不会发送短信或邮件。");
    } else {
      setLoginToken("");
      setMsg(res.message || "生成失败");
    }
  }

  async function handleImport() {
    const raw = window.prompt("每行一名学生：姓名,手机号");
    if (!raw) return;
    const items = raw.split("\n").map((line) => {
      const [realName, phone] = line.split(/[,，\s]+/);
      return { realName: realName?.trim() || "", phone: phone?.trim() || "" };
    }).filter((r) => r.realName && r.phone);
    const res = await importStudents(items);
    if (res.success) {
      setMsg(`成功 ${res.data.created.length} 人，未导入 ${res.data.failed.length} 人`);
      await load();
    } else setMsg(res.message);
  }

  return (
    <SimpleScreen title="学生" subtitle={`共 ${items.length} 人`}>
      {msg && <p style={{ margin: 0, fontSize: 14, color: "var(--c-primary)" }}>{msg}</p>}
      {loginToken && (
        <SimpleCard>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 8 }}>学员登录口令</div>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13, wordBreak: "break-all", marginBottom: 12 }}>{loginToken}</div>
          <button
            type="button"
            className="ant-btn ant-btn-default"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(loginToken);
                setMsg("口令已复制。请发给学员，在登录页粘贴到「口令登录」。");
              } catch {
                setMsg("复制失败，请手动选中下面的口令。");
              }
            }}
          >
            复制口令
          </button>
        </SimpleCard>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="ant-btn ant-btn-default" onClick={() => setShowAdd(!showAdd)}>添加</button>
        <button type="button" className="ant-btn ant-btn-default" onClick={handleImport}>批量添加</button>
      </div>
      {showAdd && (
        <SimpleCard>
          <input className="ant-input" placeholder="姓名" value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} style={{ marginBottom: 8, width: "100%" }} />
          <input className="ant-input" placeholder="手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ marginBottom: 12, width: "100%" }} />
          <PrimaryButton onClick={handleCreate}>保存</PrimaryButton>
        </SimpleCard>
      )}
      {items.map((s) => (
        <SimpleCard key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.realName}</div>
              <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>{s.phone}</div>
            </div>
            <button type="button" className="ant-btn ant-btn-default" onClick={() => handleLoginLink(s.id)}>发登录链接</button>
          </div>
        </SimpleCard>
      ))}
    </SimpleScreen>
  );
}
