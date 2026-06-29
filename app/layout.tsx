import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

// Inter — the premium geometric-grotesque sans used by Linear, Vercel & co.
// One variable family drives the whole type system (display + body).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
    title: "The Taste Makerrs",
    description: "A cake for your favorite memories.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans text-ink antialiased">
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
              <main id="main" className="min-h-[60vh]">{children}</main>
              <Footer />
              <CartDrawer />
              <FlyToCart />
              <Toaster position="bottom-right" toastOptions={{
                style: { background: "#0B0B0C", color: "#fff", borderRadius: "14px" },
                iconTheme: { primary: "#F97316", secondary: "#fff" },
              }} />
            </SmoothScroll>
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}
