"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type Review = { name: string; role: string; quote: string };

const REVIEWS: Review[] = [
  { name: "Anya", role: "Birthday order", quote: "Ordered a bento cake for my daughter — stunning design in her favourite colours, and it tasted even better than it looked." },
  { name: "Eva & Martin", role: "Wedding cake", quote: "Endless compliments on our wedding cake. Eggless, but you'd never know — moist, balanced, beautifully finished." },
  { name: "Larry", role: "Festive hamper", quote: "Sent the hamper to my parents in another city. Arrived perfect, packaging on point — they couldn't stop talking about it." },
  { name: "Priya", role: "Repeat customer", quote: "The rasmalai fusion cake is unreal. It's now my go-to for every single celebration." },
  { name: "Karan", role: "Same-day delivery", quote: "Same-day actually meant same-day. Fresh, on time, and genuinely gorgeous." },
  { name: "Meera", role: "Jain-friendly", quote: "Jain-friendly AND delicious — finally a bakery that gets it right without compromising on taste." },
  { name: "Rohan", role: "Custom photo cake", quote: "Customised a photo cake in minutes and they called to confirm every detail. Premium service end to end." },
  { name: "Sara", role: "Chocolate lover", quote: "The truffle cake is the best chocolate cake I've had in the city. Period." },
  { name: "Aditya", role: "Kids' party", quote: "The pinata cake was the star of the party — the kids absolutely went wild for it." },
  { name: "Nisha", role: "Anniversary", quote: "Beautiful, fresh, and the cream is so light. Worth every rupee and then some." },
];

function Card({ r }: { r: Review }) {
  return (
    <motion.figure
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="surface w-[300px] shrink-0 p-6 sm:w-[350px]"
    >
      <div className="mb-3 flex gap-0.5 text-flame">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-flame" />
        ))}
      </div>
      <blockquote className="text-[0.95rem] leading-relaxed text-ink-soft">&ldquo;{r.quote}&rdquo;</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-flame font-semibold text-white">{r.name.charAt(0)}</span>
        <span>
          <span className="block text-sm font-semibold text-ink">{r.name}</span>
          <span className="block text-xs text-ink-mut">{r.role}</span>
        </span>
      </figcaption>
    </motion.figure>
  );
}

function Row({ items, reverse = false, duration = 42 }: { items: Review[]; reverse?: boolean; duration?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max gap-5"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={reduce ? undefined : { x: { repeat: Infinity, repeatType: "loop", duration, ease: "linear" } }}
        style={{ willChange: reduce ? "auto" : "transform" }}
      >
        {[...items, ...items].map((r, i) => (
          <Card key={`${r.name}-${i}`} r={r} />
        ))}
      </motion.div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">In their words</span>
          <h2 className="t-h2 mt-4">A little sweetness, a lot of <span className="text-gradient">love</span>.</h2>
        </Reveal>
      </div>

      <div className="relative mt-12">
        <div className="space-y-5">
          <Row items={REVIEWS.slice(0, 5)} duration={40} />
          <Row items={REVIEWS.slice(5, 10)} reverse duration={46} />
        </div>
        {/* edge fades to the warm canvas */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-clay-50 to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-clay-50 to-transparent md:w-40" />
      </div>
    </section>
  );
}
