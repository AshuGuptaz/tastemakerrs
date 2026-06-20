"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * A coupon code chip with a working "copy to clipboard" action.
 * Replaces the old static chip whose "copy" label did nothing.
 */
export default function CouponCodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — still show feedback.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy coupon code ${code}`}
      className="mt-4 flex w-full items-center justify-between rounded-pill border border-dashed border-cocoa/30 bg-cream-100 px-4 py-2.5 transition-colors hover:border-flame hover:bg-white"
    >
      <span className="font-mono font-bold tracking-wide">{code}</span>
      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-flame">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copy
          </>
        )}
      </span>
    </button>
  );
}
