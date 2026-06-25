import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/**
 * Clean, template-style page header (white + orange gradient wash + dotted
 * backdrop). No overlapping decorative illustrations — replaces the old
 * HeaderDecor headers across inner pages.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[160%] bg-[radial-gradient(55%_120%_at_50%_-10%,rgba(249,115,22,0.18),rgba(253,186,116,0.08)_45%,transparent_72%)]" />
        <div className="absolute inset-0 bg-dots mask-fade opacity-50" />
      </div>
      <div className="container-x pb-12 pt-16 text-center md:pb-16 md:pt-24">
        <Reveal>
          <span className="t-eyebrow justify-center">{eyebrow}</span>
          <h1 className="t-display mx-auto mt-5 max-w-3xl text-balance">{title}</h1>
          {subtitle && <p className="t-lead mx-auto mt-5 max-w-2xl">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
