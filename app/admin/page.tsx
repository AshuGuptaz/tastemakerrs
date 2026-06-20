import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

// Stats come from the DB at request time — never prerender this at build.
export const dynamic = "force-dynamic";

async function getStats() {
  try {
    await connectDB();
    const [orders, products, paid] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ active: true }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    return { orders, products, revenue: paid[0]?.total || 0 };
  } catch {
    return { orders: 0, products: 0, revenue: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  return (
    <section className="bg-cream-50 py-12">
      <div className="container-x">
        <div className="flex items-end justify-between">
          <h1 className="display text-[clamp(2rem,5vw,3.5rem)]">DASHBOARD</h1>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="btn-ghost text-sm">Sign out</button>
          </form>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { label: "Total Orders", value: stats.orders, emoji: "🧾", bg: "bg-cream-100" },
            { label: "Active Products", value: stats.products, emoji: "🎂", bg: "bg-peach-100" },
            { label: "Revenue (₹)", value: `₹${stats.revenue.toLocaleString("en-IN")}`, emoji: "💸", bg: "bg-sky-100" },
          ].map((s) => (
            <div key={s.label} className="card overflow-hidden">
              <div className={`grid aspect-[16/9] place-items-center ${s.bg}`}>
                <div className="text-7xl">{s.emoji}</div>
              </div>
              <div className="p-6">
                <p className="text-sm uppercase tracking-wider text-cocoa/60">{s.label}</p>
                <p className="font-display text-3xl">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link href="/admin/products" className="card flex items-center justify-between p-6 hover:border-flame">
            <div>
              <p className="font-display text-2xl uppercase">Manage Products</p>
              <p className="text-sm text-cocoa/60">Add, edit, deactivate menu items.</p>
            </div>
            <span className="text-3xl">→</span>
          </Link>
          <Link href="/admin/orders" className="card flex items-center justify-between p-6 hover:border-flame">
            <div>
              <p className="font-display text-2xl uppercase">View Orders</p>
              <p className="text-sm text-cocoa/60">Check incoming orders, status & payments.</p>
            </div>
            <span className="text-3xl">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
