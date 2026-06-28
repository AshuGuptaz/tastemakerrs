"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
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
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

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
        toast.success("Verified! Placing your order…");
        onVerified();
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
      <motion.div
        className="fixed inset-0 z-[100] grid place-items-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          role="dialog" aria-modal="true" aria-label="Verify your contact"
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-[2rem] border border-line bg-white p-7 shadow-e3 md:p-8"
        >
          <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 text-ink-mut transition-colors hover:text-ink">
            <X className="h-5 w-5" />
          </button>

          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/10 text-flame">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold tracking-tighter2 text-ink">Verify it&apos;s you</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-mut">
            {sending ? "Sending you a 6-digit code…" : <>We sent a 6-digit code to {dest}. Pop it in below to confirm your order.</>}
          </p>

          <input
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
