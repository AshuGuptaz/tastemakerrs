"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Phone-only sticky order bar. Appears once the hero has scrolled away (the hero
 * "Order now" button is out of reach on a long phone page) and tucks away near
 * the page bottom where the final CTA + footer already carry the action.
 */
export default function StickyOrderBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const nearBottom = y + window.innerHeight > document.documentElement.scrollHeight - 700;
      setShow(y > window.innerHeight * 0.9 && !nearBottom);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-[45] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-pill border border-line bg-surface/95 py-2 pl-5 pr-2 shadow-e3 backdrop-blur-md">
        <span className="text-[0.8rem] font-medium leading-tight text-ink-soft">
          Same-day delivery
          <span className="block text-[0.7rem] text-ink-mut">Order before noon</span>
        </span>
        <Link href="/menu" tabIndex={show ? 0 : -1} className="btn-accent !py-2.5 text-sm">
          Order now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
