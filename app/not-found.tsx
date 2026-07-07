import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title={<>This page has <span className="text-gradient">crumbled</span>.</>}
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
          <Link href="/contact" className="btn-line">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
