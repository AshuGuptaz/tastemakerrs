import Link from "next/link";
import { Instagram, Facebook, Send, Mail, MapPin, Phone } from "lucide-react";

const linkCls =
  "text-sm text-ink-soft transition-colors hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 rounded-md";
const headingCls = "text-xs font-semibold uppercase tracking-[0.16em] text-ink-mut";

export default function Footer() {
  return (
    <footer className="container-x pb-10">
      <div className="rounded-[2rem] bg-sky-100 p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-sm font-bold text-white">tm</span>
              <span className="text-[1.15rem] font-semibold tracking-tighter2 text-ink">
                Taste <span className="text-flame">Makerrs</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Small-batch bakery. Baked fresh, delivered with love.
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
                  className="rounded-pill border border-line p-2.5 text-ink-soft transition-colors hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
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
              <li><Link href="/menu?cat=cupcakes" className={linkCls}>Cupcakes</Link></li>
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
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
                20B Water Works Road, Aishbagh, Lucknow, Uttar Pradesh
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-flame" />
                <a href="tel:+918881661177" className={linkCls}>+91 88816 61177</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-flame" />
                <a href="mailto:tastemakerrs@gmail.com" className={linkCls}>tastemakerrs@gmail.com</a>
              </li>
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
