/**
 * GST invoice math — pure, integer-paise, no I/O. Catalog prices are
 * TAX-INCLUSIVE, so tax is backed out of what the customer paid; the invoice
 * grand total therefore always equals Order.total exactly.
 *
 * Coupon discounts are allocated across item lines in proportion to their
 * value (the delivery fee is not discounted). Delivery is taxed at the same
 * rate as goods (composite supply).
 */

export type GstConfig = {
  /** Seller GSTIN. Unset → we issue a plain receipt with no tax breakup. */
  gstin: string | null;
  legalName: string;
  address: string;
  /** Seller's state; intra-state supply → CGST+SGST, otherwise IGST. */
  state: string;
  ratePercent: number;
};

export function gstConfig(env: Record<string, string | undefined> = process.env): GstConfig {
  const rate = Number(env.GST_RATE_PERCENT);
  return {
    gstin: env.GST_GSTIN?.trim().toUpperCase() || null,
    legalName: env.GST_LEGAL_NAME?.trim() || "The Taste Makerrs",
    address: env.GST_ADDRESS?.trim() || "Lucknow, Uttar Pradesh, India",
    state: env.GST_STATE?.trim() || "Uttar Pradesh",
    ratePercent: Number.isFinite(rate) && rate >= 0 && rate <= 28 ? rate : 18,
  };
}

export type InvoiceItemInput = { name: string; price: number; qty: number; variant?: string };

export type InvoiceLine = {
  description: string;
  qty: number;
  /** All amounts in paise. */
  gross: number; // after discount, tax-inclusive
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
};

export type Invoice = {
  lines: InvoiceLine[];
  intraState: boolean;
  totals: { gross: number; taxable: number; cgst: number; sgst: number; igst: number; discount: number };
};

const toPaise = (rupees: number) => Math.round(rupees * 100);

function normState(s?: string) {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Split `amount` across weights; remainder goes to the last non-zero weight so the parts sum exactly. */
export function allocate(amount: number, weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || amount <= 0) return weights.map(() => 0);
  const parts = weights.map((w) => Math.floor((amount * w) / total));
  let rest = amount - parts.reduce((a, b) => a + b, 0);
  for (let i = weights.length - 1; i >= 0 && rest > 0; i--) {
    if (weights[i] > 0) {
      parts[i] += rest;
      rest = 0;
    }
  }
  return parts;
}

export function buildInvoice(input: {
  items: InvoiceItemInput[];
  delivery: number;
  discount: number;
  sellerState: string;
  placeOfSupplyState?: string;
  ratePercent: number;
}): Invoice {
  const { ratePercent } = input;
  // Unknown destination state → assume intra-state (local delivery business).
  const intraState = !input.placeOfSupplyState || normState(input.placeOfSupplyState) === normState(input.sellerState);

  const itemGross = input.items.map((i) => toPaise(i.price) * i.qty);
  const discountPaise = Math.min(toPaise(input.discount), itemGross.reduce((a, b) => a + b, 0));
  const discounts = allocate(discountPaise, itemGross);

  const rows: { description: string; qty: number; gross: number }[] = input.items.map((i, idx) => ({
    description: i.variant ? `${i.name} (${i.variant})` : i.name,
    qty: i.qty,
    gross: itemGross[idx] - discounts[idx],
  }));
  if (input.delivery > 0) rows.push({ description: "Delivery charges", qty: 1, gross: toPaise(input.delivery) });

  const lines: InvoiceLine[] = rows.map((r) => {
    const taxable = Math.round((r.gross * 100) / (100 + ratePercent));
    const tax = r.gross - taxable;
    const cgst = intraState ? Math.floor(tax / 2) : 0;
    const sgst = intraState ? tax - cgst : 0;
    return { ...r, taxable, cgst, sgst, igst: intraState ? 0 : tax };
  });

  const sum = (f: (l: InvoiceLine) => number) => lines.reduce((a, l) => a + f(l), 0);
  return {
    lines,
    intraState,
    totals: {
      gross: sum((l) => l.gross),
      taxable: sum((l) => l.taxable),
      cgst: sum((l) => l.cgst),
      sgst: sum((l) => l.sgst),
      igst: sum((l) => l.igst),
      discount: discountPaise,
    },
  };
}

/** Indian financial year (Apr–Mar) label for a date, in IST, e.g. "25-26". */
export function financialYear(d: Date): string {
  const ist = new Date(d.getTime() + 5.5 * 3600 * 1000);
  const y = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? y : y - 1;
  return `${String(start).slice(-2)}-${String(start + 1).slice(-2)}`;
}

/**
 * Deterministic invoice number derived from the order (no counter to race).
 * NOTE: GST rules want a consecutive series per financial year — if your CA
 * requires strictly sequential numbers, replace this with a counter collection.
 */
export function invoiceNumber(orderId: string, createdAt: Date): string {
  return `TTM/${financialYear(createdAt)}/${orderId.slice(-6).toUpperCase()}`;
}

export const rupees = (paise: number) => paise / 100;
