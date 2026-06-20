"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import Underlined from "./Underlined";

const STEPS = [
  {
    no: "01",
    title: "Baked fresh at dawn",
    body: "Every order starts the same morning it ships. Small batches, premium ingredients, eggless and Jain-friendly on request — never frozen, never mass-produced.",
    img: "/images/cakes/vanilla.jpg",
  },
  {
    no: "02",
    title: "Handcrafted & decorated",
    body: "Our bakers pipe, layer and finish each cake by hand. Your colours, your message, your photo on top — finished to look as good as it tastes.",
    img: "/images/cakes/pinata.jpg",
  },
  {
    no: "03",
    title: "Delivered to your door",
    body: "Sealed in protective packaging and sent out for same-day delivery, so it arrives as perfect as it left the kitchen — ready for the moment that matters.",
    img: "/images/cakes/fresh-fruit.jpg",
  },
];

function StoryStep({
  step,
  index,
  progress,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const n = STEPS.length;
  const opacity = useTransform(
    progress,
    [index / n - 0.06, index / n + 0.04, (index + 1) / n - 0.04, (index + 1) / n + 0.06],
    [0.35, 1, 1, 0.35]
  );
  return (
    <motion.div style={{ opacity }} className="border-l-2 border-flame/60 pl-5">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl text-flame">{step.no}</span>
        <h3 className="font-display text-xl text-cream-50 md:text-2xl">{step.title}</h3>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-cream-50/75">{step.body}</p>
    </motion.div>
  );
}

function StoryImage({
  src,
  index,
  progress,
}: {
  src: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const reduced = useReducedMotion();
  const n = STEPS.length;
  // Each image is fully visible at the center of its segment and crossfades out.
  const start = index / n;
  const end = (index + 1) / n;
  // Index 0 must begin at full opacity at progress 0 (section just pinned),
  // otherwise the wine background shows through the first image on entry.
  const inStart = index === 0 ? start : start - 0.12;
  const opacity = useTransform(
    progress,
    [inStart, start + 0.04, end - 0.04, end + 0.12],
    [index === 0 ? 1 : 0, 1, 1, 0]
  );
  // Scroll-linked scale zoom — drop it for reduced-motion users.
  const scaleMotion = useTransform(progress, [start, end], [1.08, 1]);
  const scale = reduced ? 1 : scaleMotion;

  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      style={{ opacity, scale }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export default function StickyStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative bg-wine text-cream-50" style={{ height: "280vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* ambient glow — a single static soft glow for depth */}
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-flame/12 blur-3xl" />

        <div className="container-x grid w-full items-center gap-12 md:grid-cols-2">
          {/* Pinned image stack */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-white/15">
            {STEPS.map((s, i) => (
              <StoryImage key={s.img} src={s.img} index={i} progress={scrollYProgress} />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine/50 to-transparent" />
          </div>

          {/* Steps */}
          <div>
            <span className="pill mb-6 border border-white/15 bg-white/10 text-cream-50">
              How it works
            </span>
            <h2 className="display text-[clamp(2rem,5vw,3.5rem)] text-cream-50">
              From our oven to <Underlined>your door</Underlined>.
            </h2>

            <div className="mt-10 space-y-3">
              {STEPS.map((s, i) => (
                <StoryStep key={s.no} step={s} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>

        {/* scroll progress rail */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 right-0 h-1 origin-left bg-flame"
          aria-hidden
        />
      </div>
    </section>
  );
}
