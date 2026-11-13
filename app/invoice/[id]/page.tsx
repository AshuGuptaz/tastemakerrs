import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getAdminFromCookies } from "@/lib/auth-server";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { verifyCheckout, contactMatches, CHECKOUT_COOKIE } from "@/lib/checkout-token";
import { buildInvoice, gstConfig, invoiceNumber, rupees } from "@/lib/gst";
import { formatINR } from "@/lib/format";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

const fmt = (paise: number) => formatINR(rupees(paise));

/** Admin, the signed-in customer who owns the order, or the holder of a matching checkout token. */
async function canView(order: { customerId?: string | null; address: { email?: string; phone?: string } }) {
  if (await getAdminFromCookies()) return true;
  const claim = await getCustomerFromCookies();
  if (claim) {
    if (order.customerId && order.customerId === claim.cid) return true;
    const a = order.address;
    if (claim.phone && a.phone && contactMatches({ phone: claim.phone }, { phone: a.phone, email: a.email ?? "" })) return true;
    if (claim.email && a.email && contactMatches({ email: claim.email }, { phone: a.phone ?? "", email: a.email })) return true;
  }
  const token = await verifyCheckout(cookies().get(CHECKOUT_COOKIE)?.value);
  return contactMatches(token, { email: order.address.email ?? "", phone: order.address.phone ?? "" });
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const order = await Order.findById(params.id).lean();
  // Invoices exist only for orders that were actually paid (and refunded ones keep theirs out).
  if (!order || order.paymentStatus !== "paid") notFound();
  if (!(await canView(order))) notFound();

  const cfg = gstConfig();
  const taxInvoice = Boolean(cfg.gstin);
  const inv = buildInvoice({
    items: (order.items ?? []).map((i) => ({ name: i.name ?? "Item", price: i.price ?? 0, qty: i.qty ?? 1, variant: i.variant })),
    delivery: order.delivery ?? 0,
    discount: order.discount ?? 0,
    sellerState: cfg.state,
    placeOfSupplyState: order.address.state,
    ratePercent: cfg.ratePercent,
  });
  const no = invoiceNumber(String(order._id), order.createdAt);
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const a = order.address;
  const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink-mut";
  const td = "px-3 py-2 align-top";
  const num = "px-3 py-2 text-right tabular-nums align-top";

  return (
    <section className="bg-canvas py-10 md:py-16 print:bg-white print:py-0">
      <style>{`@media print { header, footer, nav { display: none !important; } main { padding-top: 0 !important; } body::before, body::after { display: none !important; } }`}</style>
      <div className="container-x mx-auto max-w-3xl">
        <div className="mb-4 flex justify-end print:hidden"><PrintButton /></div>

        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft md:p-10 print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{cfg.legalName}</h1>
              <p className="mt-1 max-w-xs">{cfg.address}</p>
              {cfg.gstin && <p className="mt-1"><strong>GSTIN:</strong> {cfg.gstin}</p>}
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-semibold text-ink">{taxInvoice ? "Tax Invoice" : "Payment Receipt"}</p>
              <p className="mt-1"><strong>No:</strong> {no}</p>
              <p><strong>Date:</strong> {date}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mut">Billed to</p>
              <p className="mt-1 font-semibold text-ink">{a.name}</p>
              <p>{a.street}</p>
              <p>{[a.city, a.state, a.pincode].filter(Boolean).join(", ")}</p>
              {a.phone && <p>{a.phone}</p>}
              {a.email && <p>{a.email}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mut">Order</p>
              <p className="mt-1">Ref: {String(order._id).slice(-8).toUpperCase()}</p>
              <p>Paid via {order.paymentMethod === "razorpay" ? "Razorpay" : "Stripe"}</p>
              {taxInvoice && <p>Place of supply: {a.state || cfg.state}</p>}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-y border-line bg-canvas">
                <tr>
                  <th className={th}>Item</th>
                  <th className={`${th} text-right`}>Qty</th>
                  {taxInvoice && <th className={`${th} text-right`}>Taxable</th>}
                  {taxInvoice && (inv.intraState
                    ? (<><th className={`${th} text-right`}>CGST {cfg.ratePercent / 2}%</th><th className={`${th} text-right`}>SGST {cfg.ratePercent / 2}%</th></>)
                    : <th className={`${th} text-right`}>IGST {cfg.ratePercent}%</th>)}
                  <th className={`${th} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inv.lines.map((l, i) => (
                  <tr key={i}>
                    <td className={td}>{l.description}</td>
                    <td className={num}>{l.qty}</td>
                    {taxInvoice && <td className={num}>{fmt(l.taxable)}</td>}
                    {taxInvoice && (inv.intraState
                      ? (<><td className={num}>{fmt(l.cgst)}</td><td className={num}>{fmt(l.sgst)}</td></>)
                      : <td className={num}>{fmt(l.igst)}</td>)}
                    <td className={`${num} font-medium text-ink`}>{fmt(l.gross)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                {inv.totals.discount > 0 && (
                  <tr>
                    <td className={td} colSpan={taxInvoice ? (inv.intraState ? 5 : 4) : 2}>Discount applied{order.coupon ? ` (${order.coupon})` : ""} — included above</td>
                    <td className={num}>−{fmt(inv.totals.discount)}</td>
                  </tr>
                )}
                <tr className="font-semibold text-ink">
                  <td className={td} colSpan={taxInvoice ? (inv.intraState ? 5 : 4) : 2}>Total paid (inclusive of GST)</td>
                  <td className={num}>{fmt(inv.totals.gross)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-8 text-xs text-ink-mut">
            {taxInvoice
              ? "All prices are inclusive of GST. This is a computer-generated invoice and needs no signature."
              : "This is a payment receipt. A GST tax invoice will be available once our GST details are configured."}
          </p>
        </div>
      </div>
    </section>
  );
}
