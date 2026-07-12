import Link from "next/link";
import { Instagram, Facebook, Send, Mail, MapPin, Phone } from "lucide-react";

const linkCls =
  "text-sm text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-md";
const headingCls = "text-xs font-semibold uppercase tracking-[0.16em] text-white/45";

export default function Footer() {
  return (
    <footer className="container-x pb-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white md:p-12">
        {/* warm ambient so the dark bookend feels on-brand, not cold */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-6%] top-[-30%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.28),transparent_62%)] blur-2xl" />
          <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        </div>

        <div className="relative z-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="The Taste Makerrs — home" className="group inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-redesign-mark-reversed.png" alt="" aria-hidden className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-redesign-wordmark-reversed.png" alt="The Taste Makerrs" className="h-7 w-auto select-none" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Small-batch bakery in Lucknow. Baked fresh, delivered with love.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: "https://instagram.com/thetastemakerrs", label: "Instagram", Icon: Instagram },
                { href: "https://facebook.com/thetastemakerrs", label: "Facebook", Icon: Facebook },
                { href: "https://wa.me/918881661177", label: "WhatsApp", Icon: Send },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-pill border border-white/15 p-2.5 text-white/70 transition-colors hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={headingCls}>Shop</h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/menu?cat=cakes" className={linkCls}>Cakes</Link></li>
              <li><Link href="/menu?cat=muffins" className={linkCls}>Muffins</Link></li>
              <li><Link href="/menu?cat=cookies" className={linkCls}>Cookies</Link></li>
              <li><Link href="/menu?cat=hampers" className={linkCls}>Hampers</Link></li>
              <li><Link href="/custom-cake" className={linkCls}>Customize</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={headingCls}>Company</h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/about" className={linkCls}>About</Link></li>
              <li><Link href="/kitchen" className={linkCls}>Our Kitchen</Link></li>
              <li><Link href="/offers" className={linkCls}>Offers</Link></li>
              <li><Link href="/contact" className={linkCls}>Contact</Link></li>
              <li><Link href="/privacy-policy" className={linkCls}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={headingCls}>Reach Us</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-400" />
                20B Water Works Road, Aishbagh, Lucknow, Uttar Pradesh
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-flame-400" />
                <a href="tel:+918881661177" className={linkCls}>+91 88816 61177</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-flame-400" />
                <a href="mailto:tastemakerrs@gmail.com" className={linkCls}>tastemakerrs@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} The Taste Makerrs. All rights reserved.</p>
          <p>Baked fresh, delivered with love.</p>
        </div>
      </div>
    </footer>
  );
}
