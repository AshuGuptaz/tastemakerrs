/**
 * Structured JSON logger. Emits one console line per call with a level,
 * message, optional meta object, and an ISO timestamp.
 */

type Level = "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: object): void {
  const line: Record<string, unknown> = {
    level,
    msg,
    time: new Date().toISOString(),
  };
  if (meta) line.meta = meta;
  const out = JSON.stringify(line);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

export const logger = {
  info(msg: string, meta?: object) {
    emit("info", msg, meta);
  },
  warn(msg: string, meta?: object) {
    emit("warn", msg, meta);
  },
  error(msg: string, meta?: object) {
    emit("error", msg, meta);
  },
};

/**
 * Capture an error for observability. Currently logs the message + stack as a
 * structured line. Future step: wire @sentry/nextjs (set SENTRY_DSN) and forward
 * here via Sentry.captureException — do NOT add the SDK yet.
 */
export function captureError(err: unknown, context?: object): void {
  const meta: Record<string, unknown> = { ...(context || {}) };
  if (err instanceof Error) {
    meta.error = err.message;
    meta.stack = err.stack;
  } else {
    meta.error = String(err);
  }
  emit("error", "captureError", meta);
}
