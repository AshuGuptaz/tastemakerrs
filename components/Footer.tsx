import Link from "next/link";
import { Instagram, Facebook, Send, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cocoa/10 bg-cream-100">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.42em] text-flame/80">The</span>
              <span className="font-display text-2xl tracking-wide text-cocoa">
                Taste <span className="text-flame">Makerrs</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-cocoa/70">
              Small-batch bakery handcrafting cakes, cupcakes, muffins and hampers with premium ingredients. Eggless & Jain-friendly options always available.
            </p>
            {/* TODO: point these at your real Instagram / Facebook handles and WhatsApp number */}
            <div className="mt-5 flex gap-2">
              <a href="https://instagram.com/thetastemakerrs" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-pill border border-cocoa/15 bg-white p-2.5 hover:bg-flame hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com/thetastemakerrs" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-pill border border-cocoa/15 bg-white p-2.5 hover:bg-flame hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-pill border border-cocoa/15 bg-white p-2.5 hover:bg-flame hover:text-white">
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-cocoa/60">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/menu?cat=cakes" className="hover:text-flame">Cakes</Link></li>
              <li><Link href="/menu?cat=cupcakes" className="hover:text-flame">Cupcakes</Link></li>
              <li><Link href="/menu?cat=muffins" className="hover:text-flame">Muffins</Link></li>
              <li><Link href="/menu?cat=cookies" className="hover:text-flame">Cookies</Link></li>
              <li><Link href="/menu?cat=hampers" className="hover:text-flame">Hampers</Link></li>
              <li><Link href="/custom-cake" className="hover:text-flame">Customize</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-cocoa/60">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-flame">About</Link></li>
              <li><Link href="/kitchen" className="hover:text-flame">Our Kitchen</Link></li>
              <li><Link href="/offers" className="hover:text-flame">Offers</Link></li>
              <li><Link href="/contact" className="hover:text-flame">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-flame">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-cocoa/60">Reach Us</h4>
            {/* TODO: replace with your real shop address, phone and email before launch */}
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-flame" /> Shop 14, Linking Road, Bandra West, Mumbai 400050</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-flame" /> <a href="tel:+919876543210" className="hover:text-flame">+91 98765 43210</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-flame" /> <a href="mailto:hello@thetastemakerrs.com" className="hover:text-flame">hello@thetastemakerrs.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cocoa/10 pt-6 text-xs text-cocoa/60 md:flex-row">
          <p>© {new Date().getFullYear()} The Taste Makerrs. All rights reserved.</p>
          <p>Baked fresh, delivered with love.</p>
        </div>
      </div>
    </footer>
  );
}
