"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { getBySlug } from "@/lib/products";

/**
 * Floating "chat with us" button. One tap opens WhatsApp with a pre-filled
 * message (mentions the product when the customer is on a product page).
 * Hidden on admin/maintenance. On phones it sits above the homepage's sticky
 * order bar so the two never overlap.
 */
export default function WhatsAppButton() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/maintenance")) return null;

  let text = "Hi The Taste Makerrs! I'd like to know more about your cakes.";
  const m = pathname.match(/^\/product\/([^/]+)/);
  const product = m ? getBySlug(m[1]) : undefined;
  if (product) text = `Hi The Taste Makerrs! I'd like to know more about the ${product.name}.`;
  else if (pathname.startsWith("/custom-cake")) text = "Hi The Taste Makerrs! I'd like help designing a custom cake.";
  else if (pathname.startsWith("/track")) text = "Hi The Taste Makerrs! I have a question about my order.";

  const lift = pathname === "/" ? "bottom-24 md:bottom-6" : "bottom-5 md:bottom-6";

  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`group fixed right-4 z-[44] flex items-center gap-2 rounded-pill bg-[#25D366] p-3.5 text-white shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 md:right-6 md:py-3 md:pl-4 md:pr-5 ${lift}`}
    >
      <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.1} />
      <span className="hidden text-sm font-semibold md:inline">Chat with us</span>
    </a>
  );
}
