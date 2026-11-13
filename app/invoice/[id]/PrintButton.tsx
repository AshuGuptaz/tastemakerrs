"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-accent print:hidden">
      <Printer className="h-4 w-4" /> Print / save as PDF
    </button>
  );
}
