"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldCheck, Mail, Phone, User, RotateCcw, CalendarHeart, MapPin, PackageCheck, ArrowRight, Lock } from "lucide-react";
import toast from "react-hot-toast";

type SendRes = {
  enabled?: boolean;
  otpId?: string;
  channels?: { email: boolean; sms: boolean };
  devCode?: string;
  error?: string;
  retryAfter?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

const VALUE_PROPS = [
  { Icon: RotateCcw, title: "One-tap reorder", desc: "Your favourites, back in the cart instantly." },
  { Icon: CalendarHeart, title: "Occasion reminders", desc: "We nudge you before every big day." },
  { Icon: MapPin, title: "Saved addresses", desc: "Breeze through checkout, every time." },
  { Icon: PackageCheck, title: "Live order tracking", desc: "Watch it go from our oven to your door." },
];

// Drifting decorative motifs on the dark panel (positioned + animation class).
const FLOATERS = [
  { e: "🎂", cls: "left-[8%] top-[14%] text-4xl animate-float", d: "0s" },
  { e: "🧁", cls: "right-[12%] top-[26%] text-3xl animate-float-slow", d: "0.6s" },
  { e: "🍰", cls: "left-[16%] bottom-[16%] text-3xl animate-float-slow", d: "1.1s" },
  { e: "✨", cls: "right-[18%] bottom-[24%] text-2xl animate-float", d: "0.3s" },
];

export default function SignInCard({ onSignedIn }: { onSignedIn: () => void }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean }>({ email: false, sms: false });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

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
      setCode("");
      setStep("code");
      if (res.devCode) toast.success(`Dev code: ${res.devCode}`, { duration: 8000 });
    } catch {
      toast.error("Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (codeArg?: string) => {
    const theCode = codeArg ?? code;
    if (theCode.length !== 6 || !otpId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, code: theCode }),
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

  const dest = channels.sms ? `your phone ••• ${phone.slice(-4)}` : "your email";

  // Staggered entrance helper (skipped under reduced motion).
  const enter = (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay: 0.15 + i * 0.08 } };

  return (
    <section className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden px-4 py-10 md:py-14">
      {/* ── Living canvas backdrop ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[8%] h-72 w-72 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(214,122,71,0.22),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[6%] right-[12%] h-80 w-80 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(224,139,90,0.18),transparent_66%)] blur-3xl" />
        <div className="absolute inset-0 bg-grid mask-fade opacity-[0.5]" />
      </div>

      {/* ── The floating split card ── */}
      <m.div
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-e3 md:rounded-[2.5rem] lg:grid-cols-[1.02fr_1fr]"
      >
        {/* ══ LEFT · brand half (dark) ══ */}
        <div className="relative overflow-hidden bg-ink px-8 py-10 text-white md:px-10 md:py-12">
          {/* animated glow mesh */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-28%] h-[26rem] w-[30rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(214,122,71,0.55),transparent_60%)] blur-2xl" />
            <div className="absolute bottom-[-30%] right-[-8%] h-72 w-72 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.32),transparent_62%)] blur-2xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.07]" />
            {!reduce &&
              FLOATERS.map((f, i) => (
                <span key={i} className={`absolute select-none opacity-25 ${f.cls}`} style={{ animationDelay: f.d }}>
                  {f.e}
                </span>
              ))}
          </div>

          <div className="relative flex h-full flex-col">
            <m.div {...enter(0)} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-redesign-wordmark-reversed.png" alt="The Taste Makerrs" className="h-7 w-auto select-none" />
            </m.div>

            <div className="mt-10 lg:mt-auto lg:pt-16">
              <m.p {...enter(1)} className="text-xs font-semibold uppercase tracking-[0.22em] text-flame-400">
                Members&apos; table
              </m.p>
              <m.h1 {...enter(2)} className="mt-3 font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.05] tracking-tighter2">
                Welcome to the{" "}
                <span className="bg-gradient-to-r from-flame-400 via-wheat-50 to-flame-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shine">
                  sweeter
                </span>{" "}
                side.
              </m.h1>
              <m.p {...enter(3)} className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-white/65">
                Sign in to reorder in a tap, save your occasions, and follow every cake from our oven to your door.
              </m.p>
            </div>

            {/* value props (desktop) */}
            <ul className="mt-9 hidden space-y-4 lg:block">
              {VALUE_PROPS.map((v, i) => (
                <m.li key={v.title} {...enter(4 + i)} className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-flame-400 ring-1 ring-white/10">
                    <v.Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{v.title}</div>
                    <div className="text-xs text-white/55">{v.desc}</div>
                  </div>
                </m.li>
              ))}
            </ul>

            <m.div {...enter(8)} className="mt-8 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-white/50 lg:mt-10">
              <Lock className="h-3.5 w-3.5 text-flame-400" />
              Passwordless &amp; secure — we send a one-time code, nothing to remember.
            </m.div>
          </div>
        </div>

        {/* ══ RIGHT · form half (light) ══ */}
        <div className="relative px-7 py-10 md:px-10 md:py-12">
          {/* animated shield badge */}
          <div className="relative grid h-14 w-14 place-items-center">
            {!reduce && (
              <>
                <m.span
                  className="absolute inset-0 rounded-2xl bg-flame/15"
                  animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
                <m.span
                  className="absolute inset-0 rounded-2xl bg-flame/15"
                  animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
                />
              </>
            )}
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-flame/10 text-flame">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === "contact" ? (
              <m.div
                key="contact"
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tighter2 text-ink">Sign in or join</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-mut">
                  No password needed — we&apos;ll text or email you a one-time code to confirm it&apos;s you.
                </p>

                <div className="mt-6 space-y-3.5">
                  <Field icon={User} label="Name" hint="optional">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
                  </Field>
                  <Field icon={Phone} label="Mobile">
                    <input inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" className={inputCls} />
                  </Field>
                  <Field icon={Mail} label="Email">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="you@email.com" className={inputCls} />
                  </Field>
                </div>

                <button onClick={send} disabled={busy} className="btn-accent group mt-6 w-full justify-center">
                  {busy ? "Sending…" : <>Send my code <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                </button>
              </m.div>
            ) : (
              <m.div
                key="code"
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tighter2 text-ink">Enter your code</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-mut">
                  We sent a 6-digit code to <span className="font-semibold text-ink">{dest}</span>.
                </p>

                <div className="mt-6">
                  <CodeInput value={code} disabled={busy} onChange={setCode} onComplete={(full) => { setCode(full); verify(full); }} />
                </div>

                <button onClick={() => verify()} disabled={code.length !== 6 || busy} className="btn-accent mt-6 w-full justify-center">
                  {busy ? "Verifying…" : "Verify & sign in"}
                </button>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <button onClick={() => { setStep("contact"); setCode(""); }} className="font-semibold text-ink-mut transition-colors hover:text-ink">
                    ← Change details
                  </button>
                  <button onClick={send} disabled={cooldown > 0 || busy} className="font-semibold text-flame transition-colors hover:text-flame-700 disabled:text-ink-mut/50">
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-ink-mut">
            By continuing you agree to our{" "}
            <a href="/privacy-policy" className="underline decoration-line underline-offset-2 hover:text-flame">privacy policy</a>.
          </p>
        </div>
      </m.div>
    </section>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-ink placeholder:text-ink-mut/70 transition focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/25";

function Field({ icon: Icon, label, hint, children }: { icon: React.ElementType; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mut">
        {label}
        {hint && <span className="font-medium normal-case tracking-normal text-ink-mut/60">({hint})</span>}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mut/60" />
        {children}
      </span>
    </label>
  );
}

/** Premium segmented 6-digit code input: auto-advance, backspace-back, paste-fill. */
function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (clean.length === 6) onComplete(clean);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) return;
    // Mobile SMS autofill (iOS QuickType, Android SMS Retriever) inserts the
    // full code into whichever box is focused as one native input event —
    // not six separate keystrokes. Treat that like a paste of the whole code.
    if (digits.length > 1) {
      commit(digits.slice(0, 6));
      refs.current[Math.min(digits.length, 6) - 1]?.focus();
      return;
    }
    const arr = value.padEnd(6).split("");
    arr[i] = digits;
    const next = arr.join("").trimEnd();
    commit(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.padEnd(6).split("");
      if (arr[i]?.trim()) {
        arr[i] = " ";
        onChange(arr.join("").trimEnd());
      } else if (i > 0) {
        arr[i - 1] = " ";
        onChange(arr.join("").trimEnd());
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    commit(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!value[i]?.trim();
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={value[i]?.trim() || ""}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className={`h-14 w-full rounded-xl border bg-surface text-center font-display text-2xl font-semibold text-ink transition focus:outline-none focus:ring-2 focus:ring-flame/30 disabled:opacity-50 ${
              filled ? "border-flame bg-flame/[0.04]" : "border-line focus:border-flame"
            }`}
          />
        );
      })}
    </div>
  );
}
