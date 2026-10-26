import { useCallback, useEffect, useState } from "react";
import {
  approveCertification,
  fetchAllDictionaries,
  fetchPendingCertifications,
  rejectCertification,
  type DictItem,
  type PendingCertification,
} from "../../../services/api";

type Dicts = {
  serviceAudiences: DictItem[];
  coachingTypes: DictItem[];
  industries: DictItem[];
  jobRoles: DictItem[];
};

const emptyDicts: Dicts = {
  serviceAudiences: [],
  coachingTypes: [],
  industries: [],
  jobRoles: [],
};

const emptyCaps = { audiences: [], coachingTypes: [], industries: [], jobRoles: [] };

function normalize(item: PendingCertification): PendingCertification {
  return {
    ...item,
    workExperience: item.workExperience ?? [],
    capabilities: { ...emptyCaps, ...item.capabilities },
  };
}

export function useCertificationReview() {
  const [items, setItems] = useState<PendingCertification[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dicts, setDicts] = useState<Dicts>(emptyDicts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [listRes, dictRes] = await Promise.all([fetchPendingCertifications(), fetchAllDictionaries()]);
    if (dictRes.success) setDicts(dictRes.data);
    if (listRes.success) {
      const next = listRes.data.items.map(normalize);
      setItems(next);
      setSelectedId((current) => (current && next.some((item) => item.id === current) ? current : next[0]?.id ?? null));
    } else {
      setError(listRes.message || "加载失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  function select(id: number) {
    setSelectedId(id);
    setReason("");
    setError("");
  }

  async function approve() {
    if (!selected) return;
    setBusyId(selected.id);
    const res = await approveCertification(selected.id);
    setBusyId(null);
    if (res.success) {
      setReason("");
      await load();
    } else {
      setError(res.message);
    }
  }

  async function reject() {
    if (!selected || !reason.trim()) return;
    setBusyId(selected.id);
    const res = await rejectCertification(selected.id, reason.trim());
    setBusyId(null);
    if (res.success) {
      setReason("");
      await load();
    } else {
      setError(res.message);
    }
  }

  return {
    items,
    selected,
    dicts,
    loading,
    error,
    busy: selected ? busyId === selected.id : false,
    reason,
    setReason,
    select,
    approve,
    reject,
  };
}
