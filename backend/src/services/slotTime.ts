export function clockMinutes(value: string): number {
  const [h, m] = value.split(":");
  return parseInt(h ?? "0", 10) * 60 + parseInt(m ?? "0", 10);
}

/** 结束时间相对开始日零点的分钟数。次日 00:00 记为 1440，才能覆盖开放到 24:00 的时段。 */
export function minutesFromStartDay(start: Date, end: Date): number {
  const midnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round((end.getTime() - midnight.getTime()) / 60000);
}

/** MySQL DATETIME 不接受 24:00:00。 */
export function normalizeSqlDateTime(value: string): string {
  const trimmed = value.trim().replace("T", " ");
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2}) 24:00:00$/);
  if (!match) return trimmed;
  const base = new Date(`${match[1]}T12:00:00`);
  base.setDate(base.getDate() + 1);
  const y = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${y}-${month}-${day} 00:00:00`;
}
