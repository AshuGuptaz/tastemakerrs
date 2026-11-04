import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { whatsappLink } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        titleSegments={[
          { text: "This page has" },
          { text: "crumbled.", className: "text-gradient" },
        ]}
        subtitle="The link may be old or the treat may have sold out. Let's get you back to something sweet."
      />

      <section className="section">
        <div className="container-x flex flex-wrap items-center justify-center gap-3 text-center">
          <Link href="/menu" className="btn-accent group">
            Browse the menu
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="/" className="btn-line">
            Back home
          </Link>
          <a href={whatsappLink("Hi, I couldn't find what I was looking for.")} target="_blank" rel="noopener noreferrer" className="btn-line">
            Chat with us
          </a>
        </div>
      </section>
    </>
  );
}
