"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

/**
 * Route-level error boundary. Renders INSIDE the root layout (navbar/footer
 * stay), so a crash in one page never looks like the whole site is down.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="section">
      <div className="container-x">
        <div className="surface mx-auto max-w-xl px-6 py-12 text-center shadow-e2 md:px-10">
          <p className="t-eyebrow justify-center">Something went wrong</p>
          <h1 className="t-h2 mt-4">
            That didn&apos;t <span className="text-gradient">rise</span> as planned.
          </h1>
          <p className="t-lead mx-auto mt-4 max-w-md">
            It&apos;s on us, not you — and your cart is safe. Try again, or message us and we&apos;ll help you order directly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={reset} className="btn-accent">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            <a
              href={whatsappLink("Hi, the website isn't working for me. I'd like to order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-line"
            >
              <MessageCircle className="h-4 w-4" /> Chat with us
            </a>
            <Link href="/" className="btn-line">Back home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
