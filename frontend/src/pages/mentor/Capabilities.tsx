import { useState } from "react";

const groups    = ["应届毕业生","1–5年初阶白领","6–10年职场精英","11–15年职场专家","15年+职场中高管"];
const services  = ["职业定位规划","简历诊断优化","求职投递策略","面试模拟与辅导","面试复盘","综合求职咨询","求职陪跑"];
const industries= ["互联网","AI / 科技","金融","制造","快消","教育","医疗","汽车","咨询","国央企","外企","财会","法律","其他"];
const positions = ["产品","研发","运营","市场","销售","数据","财务","HR","咨询","投资","设计","管理","其他"];

export default function Capabilities() {
  const [selGroups,     setSelGroups]     = useState(["应届毕业生","1–5年初阶白领"]);
  const [selServices,   setSelServices]   = useState(["简历诊断优化","面试模拟与辅导","职业定位规划"]);
  const [selIndustries, setSelIndustries] = useState(["互联网","AI / 科技","咨询"]);
  const [selPositions,  setSelPositions]  = useState(["产品","运营","设计"]);
  const [editing, setEditing] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    editing && set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>我的能力</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>帮助平台了解你的专长，用于智能匹配</div>
        </div>
        <button className={`ant-btn ${editing ? "ant-btn-primary" : "ant-btn-default"}`} onClick={() => setEditing(e => !e)}>
          {editing
            ? <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>保存</>
            : <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1l3 3L4 11H1V8L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>编辑</>
          }
        </button>
      </div>

      {/* Cert banner */}
      <div style={{ background: "#F6FFED", border: "1px solid #B7EB8F", borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--c-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l2 2 7-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#237804", fontSize: 14 }}>已完成认证 · 可接受项目</div>
          <div style={{ fontSize: 12, color: "#52C41A", marginTop: 1 }}>认证于 2025-07-10 · 平台运营已审核</div>
        </div>
      </div>

      {/* Basic info */}
      <Section title="基础资料" subtitle="个人职业背景信息">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16, marginBottom: 16 }}>
          {[["当前公司","某互联网科技公司"],["当前职位","高级产品经理"],["工作年限","8年"],["所在城市","上海"]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>{l}</div>
              {editing ? <input className="ant-input" defaultValue={v} /> : <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--c-text-3)", marginBottom: 4 }}>个人简介</div>
          {editing
            ? <textarea className="ant-input" rows={3} defaultValue="8年互联网产品经验，曾在BAT及头部创业公司担任产品负责人。擅长帮助应届生建立产品思维，优化求职材料，突破面试。" style={{ resize: "none" }} />
            : <div style={{ fontSize: 14, color: "var(--c-text-1)", lineHeight: 1.6 }}>8年互联网产品经验，曾在BAT及头部创业公司担任产品负责人。擅长帮助应届生建立产品思维，优化求职材料，突破面试。</div>
          }
        </div>
      </Section>

      <Section title="服务人群" subtitle="你最擅长辅导的职场阶段（可多选）">
        <TagPicker options={groups} selected={selGroups} editing={editing} color="var(--c-primary)" onToggle={v => toggle(selGroups, setSelGroups, v)} />
      </Section>

      <Section title="可辅导内容" subtitle="你能提供的求职辅导服务（可多选）">
        <TagPicker options={services} selected={selServices} editing={editing} color="var(--c-mentor-accent)" onToggle={v => toggle(selServices, setSelServices, v)} />
      </Section>

      <Section title="擅长行业" subtitle="你在哪些行业有深厚经验（可多选）">
        <TagPicker options={industries} selected={selIndustries} editing={editing} color="var(--c-purple)" onToggle={v => toggle(selIndustries, setSelIndustries, v)} />
      </Section>

      <Section title="擅长岗位" subtitle="你能辅导的目标岗位类型（可多选）">
        <TagPicker options={positions} selected={selPositions} editing={editing} color="var(--c-success)" onToggle={v => toggle(selPositions, setSelPositions, v)} />
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)" }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--c-text-3)", marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function TagPicker({ options, selected, editing, color, onToggle }: { options: string[]; selected: string[]; editing: boolean; color: string; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 13, border: `1px solid`,
            cursor: editing ? "pointer" : "default",
            background: active ? color + "12" : "#fff",
            color: active ? color : "var(--c-text-3)",
            borderColor: active ? color + "60" : "var(--c-border-2)",
            fontWeight: active ? 600 : 400,
            transition: "all 0.15s",
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
