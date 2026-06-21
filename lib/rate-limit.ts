/**
 * Fixed-window rate limiting. Uses Upstash Redis REST when configured
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN), otherwise an in-process
 * Map. Fails open: any error returns { ok: true } so a limiter outage can never
 * block real users.
 */
import { captureError } from "./logger";

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// Module-level store for the in-memory fallback (fixed window).
const memStore: Map<string, { count: number; resetAt: number }> = new Map();

function memLimit(key: string, limit: number, windowMs: number): { ok: boolean } {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: 1 <= limit };
  }
  entry.count += 1;
  return { ok: entry.count <= limit };
}

async function upstashLimit(
  url: string,
  token: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean }> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, windowMs, "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`upstash status ${res.status}`);
  const data = await res.json();
  // Pipeline returns an array of { result } objects; first is the INCR count.
  const count = Number(data?.[0]?.result);
  if (!Number.isFinite(count)) throw new Error("upstash bad response");
  return { ok: count <= limit };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean }> {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      return await upstashLimit(url, token, key, limit, windowMs);
    }
    return memLimit(key, limit, windowMs);
  } catch (err) {
    captureError(err, { scope: "rateLimit", key });
    return { ok: true };
  }
}
