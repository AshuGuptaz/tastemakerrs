import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back Soon · The Taste Makerrs",
  robots: { index: false, follow: false },
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
