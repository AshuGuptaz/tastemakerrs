"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { whatsappLink } from "@/lib/site";

/**
 * Last-resort boundary: it REPLACES the root layout, so none of the site's CSS,
 * fonts or components exist here — hence plain inline styles. It still gives the
 * customer a branded message, a reload button and a way to order via WhatsApp
 * (instead of Next's bare "Application error" screen).
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const btn: React.CSSProperties = {
    display: "inline-block", padding: "12px 24px", borderRadius: 999, fontWeight: 600,
    fontSize: 15, textDecoration: "none", cursor: "pointer", border: "1px solid #EAE3D9",
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#FBF8F3", color: "#1C1714", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 460 }}>
            <p style={{ letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 12, fontWeight: 600, color: "#A4472A", margin: 0 }}>
              The Taste Makerrs
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, lineHeight: 1.1, margin: "16px 0 12px" }}>
              We&apos;ll be right back.
            </h1>
            <p style={{ color: "#6E635B", lineHeight: 1.6, margin: "0 0 28px" }}>
              Something went wrong on our side. Please reload — or message us on WhatsApp and we&apos;ll take your order directly.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => window.location.reload()} style={{ ...btn, background: "#D67A47", color: "#fff", borderColor: "#D67A47" }}>
                Reload page
              </button>
              <a href={whatsappLink("Hi, the website isn't working for me. I'd like to order.")} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "#fff", color: "#1C1714" }}>
                Chat with us
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
