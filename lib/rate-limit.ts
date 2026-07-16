import { connectDB } from "@/lib/mongodb";
import { RateLimit } from "@/models/RateLimit";
import { logError } from "@/lib/logger";

/**
 * Best-effort client IP from proxy headers. x-real-ip is set directly by
 * Vercel's edge from the actual connection, so it's trusted first. Within
 * x-forwarded-for, a client can prepend any value it likes — each proxy hop
 * only ever appends its own address — so the trustworthy entry is the LAST
 * one, never the first.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const lastHop = xff
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .pop();
  return req.headers.get("x-real-ip")?.trim() || lastHop || "unknown";
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfter: number };

/**
 * Fixed-window rate limit backed by MongoDB — shared across all serverless
 * instances (unlike an in-memory Map, which only limits one lambda and resets
 * on cold start).
 *
 * The read-then-write version of this (check for a live window, then either
 * $inc it or upsert a fresh one) has a race at the window boundary: every
 * concurrent request that arrives while no live window exists yet (a brand
 * new key, or right after the previous window just expired) reads "no live
 * window" and takes the unconditional-allow branch, so a whole burst gets
 * through at once and the persisted count ends up at 1 regardless of how many
 * actually passed. An update pipeline collapses "reset-if-expired, otherwise
 * increment" into the single atomic document operation MongoDB guarantees,
 * closing that window entirely — including the upsert race on first-ever use
 * of a key, which findOneAndUpdate+upsert serializes internally.
 *
 * Fails OPEN: if the store is unreachable we allow the request rather than
 * lock everyone out on an infra blip.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const { limit, windowMs } = opts;
  const now = Date.now();
  const nowDate = new Date(now);
  try {
    await connectDB();
    const doc = await RateLimit.findOneAndUpdate(
      { _id: key },
      [
        {
          $set: {
            count: {
              $cond: [{ $gt: ["$resetAt", nowDate] }, { $add: ["$count", 1] }, 1],
            },
            resetAt: {
              $cond: [{ $gt: ["$resetAt", nowDate] }, "$resetAt", new Date(now + windowMs)],
            },
            expiresAt: {
              $cond: [{ $gt: ["$resetAt", nowDate] }, "$expiresAt", new Date(now + windowMs)],
            },
          },
        },
      ],
      { upsert: true, new: true }
    );
    return {
      allowed: doc.count <= limit,
      remaining: Math.max(0, limit - doc.count),
      retryAfter: Math.ceil((doc.resetAt.getTime() - now) / 1000),
    };
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
