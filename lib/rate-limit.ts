import { connectDB } from "@/lib/mongodb";
import { RateLimit } from "@/models/RateLimit";
import { logError } from "@/lib/logger";

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfter: number };

/**
 * Fixed-window rate limit backed by MongoDB — shared across all serverless
 * instances (unlike an in-memory Map, which only limits one lambda and resets
 * on cold start).
 *
 * Fails OPEN: if the store is unreachable we allow the request rather than lock
 * everyone out on an infra blip. A tiny window-boundary race can under-count by
 * one, which is fine for abuse control.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const { limit, windowMs } = opts;
  const now = Date.now();
  try {
    await connectDB();
    // Increment within the live window, if one exists.
    const live = await RateLimit.findOneAndUpdate(
      { _id: key, resetAt: { $gt: new Date(now) } },
      { $inc: { count: 1 } },
      { new: true }
    );
    if (live) {
      return {
        allowed: live.count <= limit,
        remaining: Math.max(0, limit - live.count),
        retryAfter: Math.ceil((live.resetAt.getTime() - now) / 1000),
      };
    }
    // No live window — open a fresh one.
    const resetAt = new Date(now + windowMs);
    await RateLimit.findOneAndUpdate(
      { _id: key },
      { $set: { count: 1, resetAt, expiresAt: resetAt } },
      { upsert: true }
    );
    return { allowed: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
  } catch (e) {
    logError("rate-limit", e, { key });
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }
}

/** Clear a key's window (e.g. on a successful login, so a good actor resets). */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await connectDB();
    await RateLimit.deleteOne({ _id: key });
  } catch (e) {
    logError("rate-limit/reset", e, { key });
  }
}
