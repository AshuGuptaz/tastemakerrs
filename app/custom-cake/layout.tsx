import type { Metadata } from "next";

// /custom-cake is a client page (the studio), so its metadata lives here.
export const metadata: Metadata = {
  title: "Design a Custom Cake",
  description:
    "Design your own cake — pick the size, flavour, shape and message, add a reference photo, and we'll bake it fresh. Eggless on request.",
  alternates: { canonical: "/custom-cake" },
};

export default function CustomCakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
