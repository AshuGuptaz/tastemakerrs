import Link from "next/link";
import { Instagram, Facebook, Send, Mail, MapPin, Phone } from "lucide-react";

const ring = "rounded-md transition-colors hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-sm font-bold text-white">tm</span>
              <span className="text-[1.15rem] font-semibold tracking-tighter2 text-ink">
                Taste <span className="text-flame">Makerrs</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-mut">
              Small-batch bakery handcrafting cakes, cupcakes, muffins and hampers with premium ingredients. Eggless &amp; Jain-friendly options always available.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: "https://instagram.com/thetastemakerrs", label: "Instagram", Icon: Instagram },
                { href: "https://facebook.com/thetastemakerrs", label: "Facebook", Icon: Facebook },
                { href: "https://wa.me/919876543210", label: "WhatsApp", Icon: Send },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-pill border border-line bg-canvas p-2.5 text-ink-soft transition-all hover:-translate-y-0.5 hover:border-flame/30 hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-mut">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/menu?cat=cakes" className={ring}>Cakes</Link></li>
              <li><Link href="/menu?cat=cupcakes" className={ring}>Cupcakes</Link></li>
              <li><Link href="/menu?cat=muffins" className={ring}>Muffins</Link></li>
              <li><Link href="/menu?cat=cookies" className={ring}>Cookies</Link></li>
              <li><Link href="/menu?cat=hampers" className={ring}>Hampers</Link></li>
              <li><Link href="/custom-cake" className={ring}>Customize</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-mut">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/about" className={ring}>About</Link></li>
              <li><Link href="/kitchen" className={ring}>Our Kitchen</Link></li>
              <li><Link href="/offers" className={ring}>Offers</Link></li>
              <li><Link href="/contact" className={ring}>Contact</Link></li>
              <li><Link href="/privacy-policy" className={ring}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-mut">Reach Us</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame" /> Shop 14, Linking Road, Bandra West, Mumbai 400050</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-flame" /> <a href="tel:+919876543210" className={ring}>+91 98765 43210</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-flame" /> <a href="mailto:hello@thetastemakerrs.com" className={ring}>hello@thetastemakerrs.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-mut md:flex-row">
          <p>© {new Date().getFullYear()} The Taste Makerrs. All rights reserved.</p>
          <p>Baked fresh, delivered with love.</p>
        </div>
      </div>
    </footer>
  );
}
