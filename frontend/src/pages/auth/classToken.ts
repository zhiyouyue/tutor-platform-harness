export function extractClassToken(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const marker = text.indexOf("class=");
  const candidate = marker >= 0
    ? text.slice(marker + "class=".length).split(/[&\s#]/)[0]
    : text;
  let decoded = candidate;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return null;
  }
  return /^\d+\.[A-Za-z0-9_-]+$/.test(decoded) ? decoded : null;
}
