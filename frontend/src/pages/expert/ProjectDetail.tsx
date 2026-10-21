import { useEffect, useState } from "react";
import {
  createCoachingRecord,
  createDeliverable,
  fetchProject,
  submitProjectCompletion,
  type Project,
} from "../../services/api";
import { labelCoachingNodeType, labelNodeStatus, labelProjectStatus } from "../../utils/statusLabels";

interface Props {
  projectId: string;
  onBack: () => void;
  onOpenDelivery: () => void;
}

export default function ProjectDetail({ projectId, onBack, onOpenDelivery }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [recordForm, setRecordForm] = useState({ contentSummary: "", studentIssues: "", expertAdvice: "" });
  const [deliverTitle, setDeliverTitle] = useState("");

  useEffect(() => {
    fetchProject(Number(projectId)).then((r) => { if (r.success) setProject(r.data); });
  }, [projectId]);

  if (!project) return <div style={{ padding: 24 }}>加载中…</div>;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <button className="ant-btn ant-btn-text" onClick={onBack}>← 返回</button>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{project.title}</div>
        <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 4 }}>
          {project.studentName} · ¥{project.totalAmount} · {labelProjectStatus(project.status)}
        </div>
      </div>
      <button className="ant-btn ant-btn-primary" onClick={onOpenDelivery}>进入交付空间</button>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>辅导节点</div>
        {(project.nodes || []).map((n) => (
          <div key={n.id} style={{ fontSize: 13, padding: "4px 0" }}>
            {labelCoachingNodeType(n.nodeType, n.label)} — {labelNodeStatus(n.status)}
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>新增辅导记录</div>
        <textarea className="ant-input" placeholder="辅导摘要" value={recordForm.contentSummary} onChange={(e) => setRecordForm({ ...recordForm, contentSummary: e.target.value })} />
        <button className="ant-btn ant-btn-default" onClick={async () => {
          await createCoachingRecord(Number(projectId), recordForm);
          alert("已保存");
        }}>保存记录</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>提交交付物</div>
        <input className="ant-input" placeholder="标题" value={deliverTitle} onChange={(e) => setDeliverTitle(e.target.value)} />
        <button className="ant-btn ant-btn-default" onClick={async () => {
          await createDeliverable(Number(projectId), { title: deliverTitle });
          setDeliverTitle("");
          alert("已提交");
        }}>提交</button>
      </div>
      {project.status === "in_progress" && (
        <button className="ant-btn ant-btn-primary" onClick={async () => {
          await submitProjectCompletion(Number(projectId));
          const r = await fetchProject(Number(projectId));
          if (r.success) setProject(r.data);
          alert("已提交完成申请，等待运营确认");
        }}>提交项目完成</button>
      )}
    </div>
  );
}
