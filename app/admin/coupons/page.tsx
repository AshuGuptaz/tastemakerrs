"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatINR } from "@/lib/format";

type AdminCoupon = {
  id: string; code: string; description: string; kind: "percent" | "flat"; value: number;
  minSubtotal: number | null; maxDiscount: number | null; startsAt: string | null; expiresAt: string | null;
  usageLimit: number | null; firstOrderOnly: boolean; oncePerContact: boolean; active: boolean; used: number;
};

type Form = {
  code: string; description: string; kind: "percent" | "flat"; value: string; minSubtotal: string; maxDiscount: string;
  startsAt: string; expiresAt: string; usageLimit: string; firstOrderOnly: boolean; oncePerContact: boolean;
};
const EMPTY: Form = {
  code: "", description: "", kind: "percent", value: "", minSubtotal: "", maxDiscount: "",
  startsAt: "", expiresAt: "", usageLimit: "", firstOrderOnly: false, oncePerContact: false,
};

// date input uses YYYY-MM-DD; an end date means "through the end of that day" (IST) on the server
const ymd = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10) : "");
const num = (v: string) => (v.trim() === "" ? null : Number(v));

const summary = (c: AdminCoupon) =>
  [
    c.kind === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`,
    c.maxDiscount != null && `max ${formatINR(c.maxDiscount)}`,
    c.minSubtotal != null && `min ${formatINR(c.minSubtotal)}`,
    c.firstOrderOnly && "first order only",
    c.oncePerContact && "once per customer",
  ].filter(Boolean).join(" · ");

export default function AdminCoupons() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/coupons")
      .then(async (r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => setCoupons(d && Array.isArray(d.coupons) ? d.coupons : []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, [router]);
  useEffect(load, [load]);

  const toggle = async (c: AdminCoupon) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    if (!res.ok) toast.error("Couldn't update that coupon");
    load();
  };

  const edit = (c: AdminCoupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code, description: c.description, kind: c.kind, value: String(c.value),
      minSubtotal: c.minSubtotal != null ? String(c.minSubtotal) : "", maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      startsAt: ymd(c.startsAt), expiresAt: ymd(c.expiresAt), usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      firstOrderOnly: c.firstOrderOnly, oncePerContact: c.oncePerContact,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => { setEditingId(null); setForm(EMPTY); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      description: form.description,
      kind: form.kind,
      value: Number(form.value),
      minSubtotal: num(form.minSubtotal),
      maxDiscount: num(form.maxDiscount),
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
      usageLimit: num(form.usageLimit),
      firstOrderOnly: form.firstOrderOnly,
      oncePerContact: form.oncePerContact,
    };
    try {
      const res = await fetch("/api/admin/coupons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : { code: form.code, ...payload }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(d.error || "Couldn't save the coupon"); return; }
      toast.success(editingId ? "Coupon updated" : "Coupon created");
      reset();
      load();
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <section className="bg-cream-50 py-12">
      <div className="container-x max-w-4xl">
        <Link href="/admin" className="text-sm text-cocoa/60 hover:text-flame">← Back</Link>
        <h1 className="display text-[clamp(2rem,5vw,3.5rem)]">COUPONS</h1>
        <p className="mt-2 text-sm text-cocoa/60">
          Codes are never deleted — deactivate instead, so past orders keep their code. Usage counts paid orders only.
        </p>

        <form onSubmit={save} className="card mt-6 grid gap-4 p-6 md:grid-cols-2">
          <h2 className="t-h3 md:col-span-2">{editingId ? `Edit ${form.code}` : "New coupon"}</h2>
          <div>
            <label className="label" htmlFor="cp-code">Code</label>
            <input id="cp-code" className="input uppercase" required disabled={!!editingId} value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="DIWALI25" maxLength={32} />
          </div>
          <div>
            <label className="label" htmlFor="cp-desc">Description (internal)</label>
            <input id="cp-desc" className="input" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={200} />
          </div>
          <div>
            <label className="label" htmlFor="cp-kind">Type</label>
            <select id="cp-kind" className="input" value={form.kind} onChange={(e) => set("kind", e.target.value as Form["kind"])}>
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="cp-value">{form.kind === "percent" ? "Percent (1–100)" : "Amount (₹)"}</label>
            <input id="cp-value" className="input" type="number" min={1} max={form.kind === "percent" ? 100 : undefined} required value={form.value} onChange={(e) => set("value", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cp-min">Minimum order (₹, optional)</label>
            <input id="cp-min" className="input" type="number" min={0} value={form.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cp-max">Max discount (₹, optional)</label>
            <input id="cp-max" className="input" type="number" min={0} value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cp-start">Starts (optional)</label>
            <input id="cp-start" className="input" type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cp-end">Last day (optional)</label>
            <input id="cp-end" className="input" type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cp-limit">Total uses allowed (optional)</label>
            <input id="cp-limit" className="input" type="number" min={1} value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} />
          </div>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => set("firstOrderOnly", e.target.checked)} /> First order only (customer has no paid order)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.oncePerContact} onChange={(e) => set("oncePerContact", e.target.checked)} /> Once per customer (phone or email)</label>
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving…" : editingId ? "Save changes" : "Create coupon"}</button>
            {editingId && <button type="button" onClick={reset} className="btn-line">Cancel</button>}
          </div>
        </form>

        {loading ? (
          <p className="mt-8 text-cocoa/60">Loading…</p>
        ) : (
          <div className="mt-8 space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${c.active ? "" : "opacity-60"}`}>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold">{c.code} {!c.active && <span className="ml-2 rounded-pill bg-ink/10 px-2 py-0.5 text-xs font-semibold">inactive</span>}</p>
                  <p className="text-sm text-cocoa/70">{summary(c)}</p>
                  <p className="text-xs text-cocoa/50">
                    Used {c.used}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                    {c.startsAt && ` · from ${ymd(c.startsAt)}`}{c.expiresAt && ` · until ${ymd(c.expiresAt)}`}
                    {c.description && ` · ${c.description}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(c)} className="btn-line !py-2 text-sm">Edit</button>
                  <button onClick={() => toggle(c)} className="btn-line !py-2 text-sm">{c.active ? "Deactivate" : "Activate"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
