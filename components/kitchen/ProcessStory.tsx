"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import {
  Wheat,
  CookingPot,
  Flame,
  Palette,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

type Step = { n: string; t: string; d: string; Icon: LucideIcon };

const STEPS: Step[] = [
  { n: "01", t: "Source", d: "Premium dairy, Belgian chocolate and fresh seasonal fruit — from FSSAI-approved suppliers only.", Icon: Wheat },
  { n: "02", t: "Mix", d: "Hand-whisked batters, never pre-mixes. Every batch tested for moisture and structure.", Icon: CookingPot },
  { n: "03", t: "Bake", d: "Convection-baked in small batches at exactly the right temperature, for exactly the right time.", Icon: Flame },
  { n: "04", t: "Frost", d: "Layered, levelled and frosted to order — never pre-iced, never sitting in a fridge.", Icon: Palette },
  { n: "05", t: "Pack", d: "Insulated boxes, ice-gel packs in summer, and a hand-written card on every single order.", Icon: Package },
  { n: "06", t: "Deliver", d: "Same-day across Lucknow via temperature-controlled delivery partners.", Icon: Truck },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function StepRow({
  step,
  index,
  total,
  scrollYProgress,
  reduce,
}: {
  step: Step;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const { n, t, d, Icon } = step;
  const isLeft = index % 2 === 0;

  // How "active" this node is as the orange fill reaches it.
  const start = index / total;
  const end = (index + 0.55) / total;
  const active = useTransform(scrollYProgress, [start, end], [0, 1], { clamp: true });
  const iconColor = useTransform(active, [0, 1], ["#9A9AA2", "#F97316"]);
  const glow = useTransform(active, [0, 1], [0, 1]);
  const nodeScale = useTransform(active, [0, 1], [0.92, 1]);
  const ringOpacity = useTransform(active, [0, 1], [0, 1]);

  return (
    <div className="relative py-5 pl-[4.5rem] md:grid md:grid-cols-2 md:gap-x-16 md:py-8 md:pl-0">
      {/* node on the rail */}
      <motion.div
        style={reduce ? undefined : { scale: nodeScale }}
        className="absolute left-[27px] top-5 z-10 -translate-x-1/2 md:left-1/2 md:top-8"
      >
        <div className="relative grid h-14 w-14 place-items-center rounded-full border border-line bg-white shadow-e2">
          {/* orange glow that fades in as the fill arrives */}
          <motion.span
            aria-hidden
            style={reduce ? { opacity: 1 } : { opacity: glow }}
            className="absolute -inset-1 rounded-full bg-flame/25 blur-md"
          />
          {/* orange ring once reached */}
          <motion.span
            aria-hidden
            style={reduce ? { opacity: 1 } : { opacity: ringOpacity }}
            className="absolute inset-0 rounded-full ring-2 ring-flame/60"
          />
          <motion.span
            style={reduce ? { color: "#F97316" } : { color: iconColor }}
            className="relative"
          >
            <Icon className="h-6 w-6" strokeWidth={1.6} />
          </motion.span>
        </div>
      </motion.div>

      {/* content card */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className={isLeft ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"}
      >
        <div className="surface surface-hover p-6 md:p-7">
          <div className={`flex items-center gap-3 ${isLeft ? "md:justify-end" : ""}`}>
            <span className="font-display text-sm font-semibold tracking-[0.22em] text-flame">{n}</span>
            <span className="h-px w-8 bg-line" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-mut">
              Step {index + 1} / {total}
            </span>
          </div>
          <h3 className="t-h3 mt-3">{t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-mut">{d}</p>
        </div>
      </motion.div>
    </div>
  );
}

/** Scroll-driven vertical story of how every cake is made. */
export default function ProcessStory() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.55"],
  });

  return (
    <div ref={ref} className="relative mx-auto max-w-4xl">
      {/* rail track */}
      <div
        aria-hidden
        className="absolute bottom-0 left-[27px] top-0 w-[2px] -translate-x-1/2 bg-line md:left-1/2"
      />
      {/* orange fill that tracks scroll */}
      <motion.div
        aria-hidden
        style={reduce ? { scaleY: 1 } : { scaleY: scrollYProgress }}
        className="absolute bottom-0 left-[27px] top-0 w-[2px] -translate-x-1/2 origin-top bg-gradient-to-b from-flame-400 via-flame to-flame-600 md:left-1/2"
      />

      <div className="md:space-y-2">
        {STEPS.map((step, i) => (
          <StepRow
            key={step.n}
            step={step}
            index={i}
            total={STEPS.length}
            scrollYProgress={scrollYProgress}
            reduce={reduce}
          />
        ))}
      </div>
    </div>
  );
}
