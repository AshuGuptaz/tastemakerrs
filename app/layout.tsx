import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartUIProvider } from "@/context/CartUIContext";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import CartDrawer from "@/components/CartDrawer";
import FlyToCart from "@/components/FlyToCart";
import SugarBurst from "@/components/ui/SugarBurst";

// Inter — the premium geometric-grotesque sans used by Linear, Vercel & co.
// One variable family drives the whole type system (display + body).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fraunces — characterful variable serif for headlines, product names & prices.
// opsz/SOFT/WONK axes give warmth at large sizes; italic loaded for accent words.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "The Taste Makerrs — Premium Bakery, Made With Love",
    template: "%s · The Taste Makerrs",
  },
  description:
    "Premium small-batch bakery. Eggless & Jain-friendly options. Cakes, cupcakes, muffins, cookies and hampers — handcrafted with love.",
  keywords: [
    "bakery", "cakes", "cupcakes", "muffins", "eggless cake", "jain cake",
    "custom cake", "bento cake", "premium bakery", "The Taste Makerrs",
  ],
  openGraph: {
    title: "The Taste Makerrs — Premium Bakery, Made With Love",
    description: "A cake for your favorite memories. Eggless & Jain-friendly, handcrafted in small batches.",
    type: "website",
    siteName: "The Taste Makerrs",
    locale: "en_IN",
    url: "/",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "The Taste Makerrs celebration cakes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Taste Makerrs",
    description: "A cake for your favorite memories.",
    images: ["/images/hero.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1714",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="grain min-h-screen font-sans text-ink antialiased">
        <CartProvider>
          <CartUIProvider>
            <SmoothScroll>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-e3"
              >
                Skip to content
              </a>
              <ScrollProgress />
              <Navbar />
              {/* pt offsets the fixed navbar (≈72px mobile / ≈76px desktop) so page
                  content on non-hero pages starts below the bar. The hero cancels
                  this with -mt-[72px] md:-mt-[76px] so it fills from viewport top. */}
              <main id="main" className="min-h-[60vh] pt-[72px] md:pt-[76px]">{children}</main>
              <Footer />
              <CartDrawer />
              <FlyToCart />
              <SugarBurst />
              <Toaster position="bottom-right" toastOptions={{
                style: { background: "#1C1714", color: "#fff", borderRadius: "14px" },
                iconTheme: { primary: "#D67A47", secondary: "#fff" },
              }} />
            </SmoothScroll>
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}
