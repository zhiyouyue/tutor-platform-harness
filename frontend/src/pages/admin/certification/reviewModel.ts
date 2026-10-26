import type { DictItem, PendingCertification, WorkExperienceItem } from "../../../services/api";

export interface ReviewCheck {
  label: string;
  filled: boolean;
  detail: string;
}

export function displayName(item: PendingCertification) {
  return item.realName?.trim() || item.account || "未命名专家";
}

export function avatarText(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export function formatSubmitted(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function formatRange(item: WorkExperienceItem) {
  return `${item.startDate} – ${item.endDate || "至今"}`;
}

export function capabilityCount(item: PendingCertification) {
  const caps = item.capabilities;
  if (!caps) return 0;
  return caps.audiences.length + caps.coachingTypes.length + caps.industries.length + caps.jobRoles.length;
}

export function reviewChecks(item: PendingCertification): ReviewCheck[] {
  const cityCompany = [item.city, item.currentCompany].filter((part) => part?.trim()).join(" · ");
  const jobs = item.workExperience?.length ?? 0;
  const caps = capabilityCount(item);
  return [
    { label: "姓名", filled: Boolean(item.realName?.trim()), detail: item.realName?.trim() || "未填写" },
    { label: "手机号", filled: Boolean(item.phone?.trim()), detail: item.phone?.trim() || "未填写" },
    { label: "城市 / 公司", filled: Boolean(cityCompany), detail: cityCompany || "未填写" },
    { label: "当前职位", filled: Boolean(item.currentTitle?.trim()), detail: item.currentTitle?.trim() || "未填写" },
    { label: "个人简介", filled: Boolean(item.bio?.trim()), detail: item.bio?.trim() ? "已填写" : "未填写" },
    { label: "工作经历", filled: jobs > 0, detail: jobs > 0 ? `${jobs} 段` : "未填写" },
    { label: "辅导能力", filled: caps > 0, detail: caps > 0 ? `已选 ${caps} 项` : "未选择" },
  ];
}

export function missingCount(item: PendingCertification) {
  return reviewChecks(item).filter((check) => !check.filled).length;
}

export function showText(value: string | null | undefined) {
  const text = value?.trim();
  return text ? { text, empty: false } : { text: "未填写", empty: true };
}

const GROUPS = [
  { title: "服务人群", cap: "audiences", dict: "serviceAudiences" },
  { title: "辅导内容", cap: "coachingTypes", dict: "coachingTypes" },
  { title: "行业", cap: "industries", dict: "industries" },
  { title: "岗位", cap: "jobRoles", dict: "jobRoles" },
] as const;

export function capabilityGroups(
  item: PendingCertification,
  dicts: Record<(typeof GROUPS)[number]["dict"], DictItem[]>,
) {
  return GROUPS.map((group) => {
    const codes = item.capabilities?.[group.cap] ?? [];
    const labels = codes.map((code) => dicts[group.dict]?.find((row) => row.code === code)?.label ?? code);
    return { title: group.title, labels };
  });
}
