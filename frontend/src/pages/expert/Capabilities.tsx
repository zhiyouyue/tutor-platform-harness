import { useEffect, useState } from "react";
import {
  fetchAllDictionaries,
  fetchMyCapabilities,
  saveMyCapabilities,
  type DictItem,
} from "../../services/api";

type DictKey = "serviceAudiences" | "coachingTypes" | "industries" | "jobRoles";
type CapKey = "audiences" | "coachingTypes" | "industries" | "jobRoles";

const mapDictToCap: Record<DictKey, CapKey> = {
  serviceAudiences: "audiences",
  coachingTypes: "coachingTypes",
  industries: "industries",
  jobRoles: "jobRoles",
};

export default function Capabilities() {
  const [dicts, setDicts] = useState<Record<DictKey, DictItem[]>>({
    serviceAudiences: [],
    coachingTypes: [],
    industries: [],
    jobRoles: [],
  });
  const [selected, setSelected] = useState<Record<CapKey, string[]>>({
    audiences: [],
    coachingTypes: [],
    industries: [],
    jobRoles: [],
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchAllDictionaries().then((res) => {
      if (res.success) setDicts(res.data as Record<DictKey, DictItem[]>);
    });
    fetchMyCapabilities().then((res) => {
      if (res.success) setSelected(res.data);
    });
  }, []);

  function toggle(key: CapKey, code: string) {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(code) ? prev[key].filter((c) => c !== code) : [...prev[key], code],
    }));
  }

  async function handleSave() {
    const res = await saveMyCapabilities(selected);
    setMsg(res.success ? "已保存" : res.message);
  }

  const sections: Array<{ dictKey: DictKey; title: string }> = [
    { dictKey: "serviceAudiences", title: "服务人群" },
    { dictKey: "coachingTypes", title: "辅导内容" },
    { dictKey: "industries", title: "行业" },
    { dictKey: "jobRoles", title: "岗位" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>我的能力</div>
          <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>字典来自后端 seed，勾选后保存</div>
        </div>
        <button className="ant-btn ant-btn-primary" onClick={handleSave}>保存</button>
      </div>
      {msg && <div style={{ fontSize: 13, color: "var(--c-primary)" }}>{msg}</div>}
      {sections.map(({ dictKey, title }) => {
        const capKey = mapDictToCap[dictKey];
        return (
          <div key={dictKey} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--c-border)", padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dicts[dictKey].map((d) => (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => toggle(capKey, d.code)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid",
                    borderColor: selected[capKey].includes(d.code) ? "var(--c-primary)" : "var(--c-border)",
                    background: selected[capKey].includes(d.code) ? "var(--c-primary-bg)" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
