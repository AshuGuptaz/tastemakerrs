"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatINR } from "@/lib/format";

type P = {
  _id?: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  description: string;
  image?: string;
  bg?: string;
  bestseller?: boolean;
  eggless?: boolean;
  customizable?: boolean;
  active?: boolean;
};

const EMPTY: P = {
  slug: "", name: "", category: "cakes", price: 0, unit: "", description: "",
  image: "🎂", bg: "bg-cream-100",
  bestseller: false, eggless: true, customizable: false, active: true,
};

export default function AdminProducts() {
  const [list, setList] = useState<P[]>([]);
  const [editing, setEditing] = useState<P>(EMPTY);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: P) => {
    setEditing(p);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = async () => {
    setBusy(true);
    try {
      const isEdit = !!editing._id;
      const url = isEdit ? `/api/products/${editing._id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error("Save failed");
      toast.success(isEdit ? "Updated" : "Created");
      setEditing(EMPTY);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    if (!confirm("Deactivate this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Removed");
    load();
  };

  return (
    <section className="bg-cream-50 py-12">
      <div className="container-x">
        <Link href="/admin" className="text-sm text-cocoa/60 hover:text-flame">← Back</Link>
        <h1 className="display text-[clamp(2rem,5vw,3.5rem)]">PRODUCTS</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Cat</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p._id || p.slug} className={i % 2 ? "bg-cream-50" : ""}>
                    <td className="p-3 font-semibold">
                      {p.image && (p.image.startsWith("/") || p.image.startsWith("http")) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="mr-2 inline h-8 w-8 rounded object-cover align-middle" />
                      ) : (
                        <span className="mr-1">{p.image}</span>
                      )}
                      {p.name}
                    </td>
                    <td className="p-3 text-cocoa/70">{p.category}</td>
                    <td className="p-3">{formatINR(p.price)}</td>
                    <td className="p-3">
                      {p.active === false ? <span className="text-rose-500">Inactive</span> : <span className="text-flame">Active</span>}
                      {p.bestseller && <span className="ml-1 rounded-pill bg-flame/10 px-2 text-xs text-flame">★</span>}
                    </td>
                    <td className="p-3 text-right">
                      {p._id ? (
                        <>
                          <button onClick={() => startEdit(p)} className="text-flame hover:underline">Edit</button>
                          <button onClick={() => remove(p._id)} className="ml-3 text-rose-500 hover:underline">Remove</button>
                        </>
                      ) : (
                        <span className="text-xs text-cocoa/40">seed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside ref={formRef} className="card p-5 lg:sticky lg:top-24 self-start">
            <h3 className="font-display text-xl uppercase">{editing._id ? "Edit" : "New"} Product</h3>
            <div className="mt-4 grid gap-3">
              <input className="input" aria-label="Name" placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
              <input className="input" aria-label="Slug" placeholder="slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {["cakes", "muffins", "cookies", "chocolates", "jars", "hampers"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className="input" type="number" min={0} aria-label="Price" placeholder="Price" value={editing.price === 0 && !editing._id ? "" : editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              <input className="input" aria-label="Unit" placeholder="Unit (e.g. 500g, Box of 6)" value={editing.unit || ""} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} />
              <input className="input" aria-label="Image" placeholder="Image emoji or URL" value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
              <textarea className="input" rows={3} aria-label="Description" placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.bestseller} onChange={(e) => setEditing({ ...editing, bestseller: e.target.checked })} className="accent-flame" /> Bestseller</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.eggless} onChange={(e) => setEditing({ ...editing, eggless: e.target.checked })} className="accent-flame" /> Eggless</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.customizable} onChange={(e) => setEditing({ ...editing, customizable: e.target.checked })} className="accent-flame" /> Customizable</label>
              </div>
              <button onClick={save} disabled={busy} className="btn-primary justify-center">{busy ? "Saving..." : (editing._id ? "Save changes" : "Create product")}</button>
              {editing._id && <button onClick={() => setEditing(EMPTY)} className="btn-ghost justify-center">Cancel edit</button>}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
