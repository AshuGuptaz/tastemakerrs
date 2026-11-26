import type { Metadata, Viewport } from "next";
import { DM_Sans, Fredoka } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartUIProvider } from "@/context/CartUIContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { WishlistProvider } from "@/context/WishlistContext";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import CartDrawer from "@/components/CartDrawer";
import FlyToCart from "@/components/FlyToCart";
import SugarBurst from "@/components/ui/SugarBurst";
import CartSync from "@/components/CartSync";
import Analytics from "@/components/Analytics";

// Brand v5 "two voices".
// DM Sans — body copy, menus, labels and small print (italic loaded for emphasis).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
});

// Fredoka — rounded display face, "anything we would pipe onto a cake".
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "The Taste Makerrs — Premium Bakery, Made With Love",
    template: "%s · The Taste Makerrs",
  },
  description:
    "Premium small-batch bakery. Eggless options. Cakes, cupcakes, muffins, cookies and hampers — handcrafted with love.",
  keywords: [
    "bakery", "cakes", "cupcakes", "muffins", "eggless cake",
    "custom cake", "bento cake", "premium bakery", "The Taste Makerrs",
  ],
  openGraph: {
    title: "The Taste Makerrs — Premium Bakery, Made With Love",
    description: "A cake for your favorite memories. Eggless, handcrafted in small batches.",
    type: "website",
    siteName: "The Taste Makerrs",
    locale: "en_IN",
    url: "/",
    images: [{ url: "/images/hero-og.jpg", width: 1200, height: 630, alt: "The Taste Makerrs celebration cakes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Taste Makerrs",
    description: "A cake for your favorite memories.",
    images: ["/images/hero-og.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6A2A1B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fredoka.variable}`}>
      <body className="grain min-h-screen font-sans text-ink antialiased">
        <Analytics />
        <CustomerProvider>
        <WishlistProvider>
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
              <CartSync />
              <Toaster position="bottom-right" toastOptions={{
                style: { background: "#6A2A1B", color: "#F6E7C9", borderRadius: "14px" },
                iconTheme: { primary: "#F4CF7A", secondary: "#6A2A1B" },
              }} />
            </SmoothScroll>
          </CartUIProvider>
        </CartProvider>
        </WishlistProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
