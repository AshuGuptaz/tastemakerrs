import type { Metadata } from "next";

// /menu is a client page (filters/search state), so its metadata lives here.
export const metadata: Metadata = {
  title: "Menu — Cakes, Cupcakes, Cookies & Hampers",
  description:
    "Browse the full menu: signature cakes, cupcakes, muffins, cookies, dessert jars and gift hampers. Eggless options for every cake, handcrafted in small batches.",
  alternates: { canonical: "/menu" },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
