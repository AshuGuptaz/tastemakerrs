import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import PageHeader from "@/components/ui/PageHeader";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        titleSegments={[
          { text: "Let's make" },
          { text: "sweet", className: "text-gradient" },
          { text: "plans" },
        ]}
        subtitle="For custom cakes, bulk orders, weddings and corporate gifting — message us on WhatsApp and we'll be back in 2 hours."
      />

      <section className="section">
        <div className="container-x flex justify-center">
          <a
            href={whatsappLink("Hi, I want to order")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-pill bg-[#25D366] px-8 py-4 text-base font-semibold text-white shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas max-sm:w-full"
          >
            <MessageCircle className="h-6 w-6" strokeWidth={2.1} />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
