/**
 * Tiny structured logger. Emits single-line JSON so Vercel/Datadog/etc. can
 * parse levels and scopes instead of grepping free-form strings.
 *
 * Also forwards errors from `logError` to Sentry, which is always initialized
 * (DSN is set directly in sentry.server.config.ts / sentry.edge.config.ts /
 * instrumentation-client.ts, not via a SENTRY_DSN env var) — so this call is
 * unconditional, not gated on an env var that's never actually read at init.
 *
 * NEVER pass secrets or full PII payloads in `meta` — log identifiers, not
 * card/OTP/token values.
 */

import * as Sentry from "@sentry/nextjs";

type Meta = Record<string, unknown>;

function emit(level: "error" | "warn" | "info", scope: string, message: string, meta?: Meta) {
  const line = JSON.stringify({ level, scope, message, ...(meta || {}), ts: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logError(scope: string, err: unknown, meta?: Meta) {
  const message = err instanceof Error ? err.message : String(err);
  emit("error", scope, message, meta);
  Sentry.captureException(err, { tags: { scope }, extra: meta });
}

export function logWarn(scope: string, message: string, meta?: Meta) {
  emit("warn", scope, message, meta);
}

export function logInfo(scope: string, message: string, meta?: Meta) {
  emit("info", scope, message, meta);
}
