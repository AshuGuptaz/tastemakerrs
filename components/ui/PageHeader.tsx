import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/**
 * Dark premium page header (matches the home CTA panel): a near-black rounded
 * panel with an orange gradient glow, a pill eyebrow, a bold white headline
 * (orange-gradient accent words), and a muted subtitle. Used across every inner
 * page so the whole site shares the same premium dark moment.
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
    <section className="container-x pt-4 md:pt-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center md:rounded-[2.5rem] md:px-12 md:py-20">
          {/* orange glow mesh */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-32%] h-[26rem] w-[34rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.50),transparent_60%)] blur-2xl" />
            <div className="absolute bottom-[-45%] right-[6%] h-72 w-72 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.35),transparent_62%)] blur-2xl" />
            <div className="absolute bottom-[-30%] left-[4%] h-64 w-64 animate-float rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.30),transparent_64%)] blur-2xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          </div>

          <div className="relative z-10">
            <span className="gradient-ring relative inline-flex items-center gap-2.5 overflow-hidden rounded-pill bg-white/[0.07] px-4 py-[0.45rem] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
              {/* shine sweep */}
              <span
                aria-hidden
                className="animate-shine pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.11) 50%, transparent 75%)", backgroundSize: "200% 100%" }}
              />
              {/* ping dot */}
              <span className="relative flex h-[5px] w-[5px] shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-400 opacity-60" />
                <span className="relative h-[5px] w-[5px] rounded-full bg-flame-400 shadow-[0_0_5px_2px_rgba(249,115,22,0.65)]" />
              </span>
              {eyebrow}
            </span>
            <h1 className="font-display mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-tighter2 text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{subtitle}</p>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
