"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, X } from "lucide-react";
import toast from "react-hot-toast";

type SendRes = {
  enabled?: boolean;
  otpId?: string;
  channels?: { email: boolean; sms: boolean };
  devCode?: string;
  error?: string;
  retryAfter?: number;
};

export default function OtpDialog({
  email,
  phone,
  name,
  onVerified,
  onSkip,
  onClose,
}: {
  email: string;
  phone: string;
  name?: string;
  onVerified: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [otpId, setOtpId] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean }>({ email: false, sms: false });
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifiedDone, setVerifiedDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const verifyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const send = async () => {
    setSending(true);
    try {
      const res: SendRes = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, name }),
      }).then((r) => r.json());

      if (res.enabled === false) { onSkip(); return; }
      if (res.error) {
        if (res.retryAfter) setCooldown(res.retryAfter);
        toast.error(res.error);
        return;
      }
      setOtpId(res.otpId || null);
      setChannels(res.channels || { email: false, sms: false });
      setCooldown(30);
      if (res.devCode) toast.success(`Dev code: ${res.devCode}`, { duration: 8000 });
    } catch {
      toast.error("Could not send the code. Try again.");
    } finally {
      setSending(false);
    }
  };

  // send once on mount
  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // clean up the auto-proceed timer if the dialog unmounts early
  useEffect(() => () => clearTimeout(verifyTimeoutRef.current), []);

  // dialog a11y: Escape closes, scroll is locked, focus is restored on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [onClose]);
  // move focus into the code field once the send resolves
  useEffect(() => { if (!sending && otpId) inputRef.current?.focus(); }, [sending, otpId]);

  const verify = async () => {
    if (code.length !== 6 || !otpId) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, code }),
      }).then((r) => r.json());
      if (res.ok) {
        setVerifiedDone(true);
        verifyTimeoutRef.current = setTimeout(onVerified, 1600);
      } else {
        toast.error(res.error || "Incorrect code");
        setCode("");
      }
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const dest =
    channels.email && channels.sms ? "your email and phone" : channels.sms ? `your phone (••• ${phone.slice(-4)})` : "your email";

  return (
    <AnimatePresence>
      <m.div
        className="fixed inset-0 z-[100] grid place-items-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
        <m.div
          role="dialog" aria-modal="true" aria-label="Verify your contact"
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-[2rem] border border-line bg-white p-7 shadow-e3 md:p-8"
        >
          {!verifiedDone && (
            <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 text-ink-mut transition-colors hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {verifiedDone ? (
              /* ── Success screen ── */
              <m.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center py-6 text-center"
              >
                {/* pulsing ring */}
                <div className="relative grid h-24 w-24 place-items-center">
                  <m.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1.55, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-flame/20"
                  />
                  <m.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-flame/15"
                  />
                  <m.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.05 }}
                    className="relative grid h-20 w-20 place-items-center rounded-full bg-flame text-white shadow-soft"
                  >
                    <Check className="h-9 w-9 stroke-[2.5]" />
                  </m.div>
                </div>

                <m.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 }}
                  className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink"
                >
                  Verified!
                </m.h3>

                <m.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="mt-2 text-sm text-ink-mut"
                >
                  Placing your order…
                </m.p>

                {/* loading dots */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 flex gap-1.5"
                >
                  {[0, 1, 2].map((i) => (
                    <m.span
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      className="h-2 w-2 rounded-full bg-flame/60"
                    />
                  ))}
                </m.div>
              </m.div>
            ) : (
              /* ── OTP form ── */
              <m.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/10 text-flame">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tighter2 text-ink">Verify it&apos;s you</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mut">
                  {sending ? "Sending you a 6-digit code…" : <>We sent a 6-digit code to {dest}. Pop it in below to confirm your order.</>}
                </p>

                <input
                  ref={inputRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") verify(); }}
                  placeholder="••••••"
                  aria-label="6-digit verification code"
                  className="mt-6 w-full rounded-2xl border border-line bg-cream-50 px-4 py-4 text-center font-display text-3xl font-semibold tracking-[0.5em] text-ink placeholder:text-ink-mut/40 focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/25"
                />

                <button
                  onClick={verify}
                  disabled={code.length !== 6 || verifying || sending}
                  className="btn-accent mt-5 w-full justify-center disabled:opacity-50"
                >
                  {verifying ? "Verifying…" : "Verify & place order"}
                </button>

                <div className="mt-4 text-center text-sm text-ink-mut">
                  Didn&apos;t get it?{" "}
                  <button
                    onClick={send}
                    disabled={cooldown > 0 || sending}
                    className="font-semibold text-flame disabled:text-ink-mut/50"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
