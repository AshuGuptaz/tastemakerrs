"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { ShieldCheck, Mail, Phone, User } from "lucide-react";
import toast from "react-hot-toast";

type SendRes = {
  enabled?: boolean;
  otpId?: string;
  channels?: { email: boolean; sms: boolean };
  devCode?: string;
  error?: string;
  retryAfter?: number;
};

/**
 * Passwordless sign-in: collect phone + email (same contact the OTP flow
 * requires), send a code, verify it. On success the /api/otp/verify route sets
 * the customer session cookie — we just tell the parent to refresh.
 */
export default function SignInCard({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean }>({ email: false, sms: false });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  const send = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) return toast.error("Enter a valid 10-digit mobile number");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address");
    setBusy(true);
    try {
      const res: SendRes = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, name: name || undefined }),
      }).then((r) => r.json());

      if (res.enabled === false) {
        toast.error("Sign-in is temporarily unavailable. Please try again later.");
        return;
      }
      if (res.error) {
        if (res.retryAfter) setCooldown(res.retryAfter);
        toast.error(res.error);
        return;
      }
      setOtpId(res.otpId || null);
      setChannels(res.channels || { email: false, sms: false });
      setCooldown(30);
      setStep("code");
      if (res.devCode) toast.success(`Dev code: ${res.devCode}`, { duration: 8000 });
    } catch {
      toast.error("Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6 || !otpId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, code }),
      }).then((r) => r.json());
      if (res.ok) {
        toast.success("Signed in!");
        onSignedIn();
      } else {
        toast.error(res.error || "Incorrect code");
        setCode("");
      }
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const dest = channels.sms ? `your phone (••• ${phone.slice(-4)})` : "your email";

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-md rounded-[2rem] border border-line bg-white p-7 shadow-e2 md:p-8"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/10 text-flame">
        <ShieldCheck className="h-6 w-6" />
      </div>

      {step === "contact" ? (
        <>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tighter2 text-ink">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-mut">
            No password needed — we&apos;ll send a one-time code to verify it&apos;s you. Your orders, addresses and saved
            occasions all live here.
          </p>

          <label className="mt-6 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mut"><User className="h-3.5 w-3.5" /> Name <span className="normal-case text-ink-mut/60">(optional)</span></span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mut"><Phone className="h-3.5 w-3.5" /> Mobile</span>
            <input
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mut"><Mail className="h-3.5 w-3.5" /> Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20"
            />
          </label>

          <button onClick={send} disabled={busy} className="btn-accent mt-6 w-full justify-center disabled:opacity-50">
            {busy ? "Sending…" : "Send code"}
          </button>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tighter2 text-ink">Enter your code</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-mut">We sent a 6-digit code to {dest}.</p>

          <input
            ref={codeRef}
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

          <button onClick={verify} disabled={code.length !== 6 || busy} className="btn-accent mt-5 w-full justify-center disabled:opacity-50">
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm text-ink-mut">
            <button onClick={() => { setStep("contact"); setCode(""); }} className="font-semibold text-ink-mut hover:text-ink">← Change details</button>
            <button onClick={send} disabled={cooldown > 0 || busy} className="font-semibold text-flame disabled:text-ink-mut/50">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}
    </m.div>
  );
}
