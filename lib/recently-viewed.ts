const KEY = "ttm_recently_viewed_v1";
const MAX = 12;

// Most-recently-viewed id first. Safe to call from any client component —
// swallows storage errors the same way CartContext does (quota/disabled).
export function recordView(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const ids: string[] = Array.isArray(parsed) ? parsed : [];
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
