// Lightweight localStorage cache for client components
// Stores { ts: number, ttl: number, value: T }

export function cacheGet<T = unknown>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts?: number; ttl?: number; value?: T };
    if (!parsed || typeof parsed.ts !== "number") return null;
    if (parsed.ttl && Date.now() - parsed.ts > parsed.ttl) return null;
    return (parsed.value as T) ?? null;
  } catch {
    return null;
  }
}

export function cacheSet<T = unknown>(key: string, value: T, ttlMs = 300_000) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ ts: Date.now(), ttl: ttlMs, value });
    window.localStorage.setItem(key, payload);
  } catch {
    // ignore quota/serialization errors
  }
}
