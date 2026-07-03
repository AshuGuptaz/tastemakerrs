"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const CHECKLIST = [
  "FSSAI-registered pure-veg kitchen",
  "Hand-finished — never pre-iced",
  "Same-day delivery across Lucknow",
];

/**
 * Scattered avatar cluster. Each avatar is a colored circle with a single
 * initial — positioned absolutely in an oval orbit around a centre badge.
 * Positions use % so the cluster scales cleanly down to the mobile height.
 */
type Avatar = {
  initial: string;
  bg: string;
  text: string;
  size: string;
  top: string;
  left: string;
  float: number; // bob distance (px)
  dur: number; // loop duration (s)
  delay: number;
};

const AVATARS: Avatar[] = [
  { initial: "A", bg: "bg-flame/15", text: "text-flame-600", size: "h-16 w-16", top: "8%", left: "16%", float: 8, dur: 5.2, delay: 0 },
  { initial: "M", bg: "bg-ink/10", text: "text-ink", size: "h-12 w-12", top: "4%", left: "62%", float: 6, dur: 4.4, delay: 0.6 },
  { initial: "R", bg: "bg-peach-200", text: "text-flame-600", size: "h-20 w-20", top: "24%", left: "78%", float: 8, dur: 5.8, delay: 0.3 },
  { initial: "S", bg: "bg-flame/15", text: "text-flame-600", size: "h-14 w-14", top: "62%", left: "70%", float: 7, dur: 4.8, delay: 0.9 },
  { initial: "K", bg: "bg-ink/10", text: "text-ink", size: "h-16 w-16", top: "76%", left: "30%", float: 8, dur: 5.4, delay: 0.2 },
  { initial: "P", bg: "bg-peach-200", text: "text-flame-600", size: "h-12 w-12", top: "58%", left: "8%", float: 6, dur: 4.6, delay: 0.7 },
  { initial: "N", bg: "bg-flame/15", text: "text-flame-600", size: "h-14 w-14", top: "34%", left: "2%", float: 7, dur: 5.0, delay: 0.4 },
];

function AvatarCluster() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto h-[320px] w-full max-w-md md:h-[460px] md:max-w-none">
      {AVATARS.map((a) => (
        <m.div
          key={a.initial + a.top}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: a.top, left: a.left }}
          animate={reduce ? undefined : { y: [0, -a.float, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: a.dur, ease: "easeInOut", repeat: Infinity, delay: a.delay }
          }
        >
          <div
            className={`flex items-center justify-center rounded-full shadow-e1 ${a.bg} ${a.size}`}
          >
            <span className={`text-lg font-bold ${a.text}`}>{a.initial}</span>
          </div>
        </m.div>
      ))}

      {/* Centre badge */}
      <m.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={
          reduce ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      >
        <div className="surface flex h-16 w-16 items-center justify-center rounded-2xl shadow-e2">
          <Sparkles className="h-7 w-7 text-flame" strokeWidth={2} />
        </div>
      </m.div>
    </div>
  );
}

export default function LovedBy() {
  return (
    <section className="section">
      <div className="container-x">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* LEFT — copy + checklist */}
          <Reveal>
            <div>
              <p className="t-eyebrow">The community</p>
              <h2 className="t-h2 mt-3">
                Real people. Real{" "}
                <span className="text-gradient">celebrations</span>.
              </h2>
              <p className="t-lead mt-5 max-w-md">
                Birthdays, anniversaries, or just-because moments — thousands of
                sweet memories start in our kitchen. Here&apos;s why they keep
                coming back.
              </p>

              <ul className="mt-8 space-y-4">
                {CHECKLIST.map((item, i) => (
                  <m.li
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.1 }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-flame/10">
                      <Check className="h-4 w-4 text-flame" strokeWidth={2.5} />
                    </span>
                    <span className="text-[0.95rem] font-medium text-ink-soft">
                      {item}
                    </span>
                  </m.li>
                ))}
              </ul>

              <Link href="/menu" className="btn-ink mt-9 inline-flex">
                Order yours
              </Link>
            </div>
          </Reveal>

          {/* RIGHT — floating avatar cluster */}
          <Reveal delay={0.1}>
            <AvatarCluster />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
