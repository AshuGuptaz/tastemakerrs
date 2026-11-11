"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_ID } from "@/lib/analytics";

// App Router navigations are client-side, so GA's automatic page_view only
// sees the first load. Send one manually per route change.
function PageViews() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const qs = sp.toString();
  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: qs ? `${pathname}?${qs}` : pathname,
      page_location: window.location.href,
    });
  }, [pathname, qs]);
  return null;
}

export default function Analytics() {
  // Skip admin entirely and don't load anything without an ID.
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false, anonymize_ip: true });
      `}</Script>
      <Suspense fallback={null}><PageViews /></Suspense>
    </>
  );
}
