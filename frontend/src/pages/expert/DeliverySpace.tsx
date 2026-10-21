import { useEffect, useRef, useState } from "react";
import {
  fetchAppointments,
  fetchMessages,
  fetchProjectFiles,
  sendMessage,
  uploadProjectFile,
} from "../../services/api";
import { labelAppointmentStatus } from "../../utils/statusLabels";

export default function DeliverySpace({ projectId }: { projectId?: string | null }) {
  const [channel, setChannel] = useState<"expert_ops" | "expert_student">("expert_student");
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [appointments, setAppointments] = useState<Array<Record<string, unknown>>>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<Array<Record<string, unknown>>>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pid = projectId ? Number(projectId) : null;

  function loadFiles() {
    if (!pid) return;
    fetchProjectFiles(pid).then((r) => { if (r.success) setFiles(r.data.items); });
  }

  useEffect(() => {
    if (!pid) return;
    fetchMessages(pid, channel).then((r) => { if (r.success) setMessages(r.data.items); });
    fetchAppointments(pid).then((r) => { if (r.success) setAppointments(r.data.items); });
    loadFiles();
  }, [pid, channel]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!pid || !file) return;
    setUploading(true);
    try {
      await uploadProjectFile(pid, file, "deliverable");
      loadFiles();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSend() {
    if (!pid || !input.trim()) return;
    await sendMessage(pid, input.trim(), channel);
    setInput("");
    const r = await fetchMessages(pid, channel);
    if (r.success) setMessages(r.data.items);
  }

  if (!pid) {
    return <div style={{ padding: 24, color: "var(--c-text-3)" }}>请从项目详情进入交付空间</div>;
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>交付空间 · 项目 #{pid}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ant-btn ant-btn-default" onClick={() => setChannel("expert_student")}>专家↔学员</button>
        <button className="ant-btn ant-btn-default" onClick={() => setChannel("expert_ops")}>专家↔运营</button>
      </div>
      <div style={{ flex: 1, background: "#fff", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16, overflow: "auto" }}>
        {messages.map((m) => (
          <div key={m.id as number} style={{ marginBottom: 12, fontSize: 14 }}>
            <span style={{ color: "var(--c-text-3)", fontSize: 12 }}>{m.senderName as string} · {new Date(m.createdAt as string).toLocaleString()}</span>
            <div>{m.content as string}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="ant-input" style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入消息…" />
        <button className="ant-btn ant-btn-primary" onClick={handleSend}>发送</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>项目文件</div>
          <button className="ant-btn ant-btn-default" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? "上传中…" : "上传文件"}
          </button>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
        </div>
        {files.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>暂无文件</div>
        ) : files.map((f) => (
          <div key={f.id as number} style={{ fontSize: 13, padding: "4px 0" }}>
            {f.file_name as string} · {f.category as string} · {new Date(f.created_at as string).toLocaleString()}
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>预约</div>
        {appointments.length === 0 ? <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>暂无预约</div> : appointments.map((a) => (
          <div key={a.id as number} style={{ fontSize: 13, padding: "4px 0" }}>
            {a.topic as string || "辅导"} · {new Date(a.start_at as string).toLocaleString("zh-CN")} · {labelAppointmentStatus(a.status as string)}
          </div>
        ))}
      </div>
    </div>
  );
}
