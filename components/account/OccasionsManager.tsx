"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { CalendarHeart, Plus, Trash2, Bell } from "lucide-react";
import toast from "react-hot-toast";
import type { OccasionDTO } from "@/lib/account-serialize";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TYPES = [
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "other", label: "Other" },
] as const;

const BLANK = { label: "", type: "birthday" as const, date: "", recipientName: "" };

export default function OccasionsManager({ occasions, onChanged }: { occasions: OccasionDTO[]; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{ label: string; type: "birthday" | "anniversary" | "other"; date: string; recipientName: string }>({ ...BLANK });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.label.trim()) return toast.error("Give the occasion a name");
    if (!form.date) return toast.error("Pick a date");
    // date is YYYY-MM-DD; we only keep month + day (occasions recur yearly)
    const [, mm, dd] = form.date.split("-").map(Number);
    setBusy(true);
    try {
      const res = await fetch("/api/account/occasions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: form.label, type: form.type, month: mm, day: dd, recipientName: form.recipientName, remind: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      toast.success("Occasion saved — we'll remind you!");
      setForm({ ...BLANK });
      setAdding(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the occasion.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/account/occasions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Occasion removed");
      onChanged();
    } catch {
      toast.error("Could not remove the occasion.");
    }
  };

  return (
    <div className="space-y-3">
      {occasions.length === 0 && !adding && (
        <p className="text-sm text-ink-mut">Save birthdays &amp; anniversaries and we&apos;ll remind you a week before — never miss a celebration.</p>
      )}

      {occasions.map((o) => (
        <div key={o._id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="flex gap-3">
            <CalendarHeart className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{o.label}</span>
                {o.remind && (
                  <span className="flex items-center gap-1 rounded-pill bg-flame/10 px-2 py-0.5 text-[0.65rem] font-semibold text-flame-700">
                    <Bell className="h-2.5 w-2.5" /> Reminder on
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink-mut">
                {MONTHS[(o.month ?? 1) - 1]} {o.day}
                {o.recipientName ? ` · ${o.recipientName}` : ""}
              </p>
            </div>
          </div>
          <button onClick={() => remove(o._id)} aria-label="Remove occasion" className="text-ink-mut transition-colors hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <AnimatePresence initial={false}>
        {adding && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-line bg-cream-50/60 p-4">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Mom's birthday"
                  className="rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-sm text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20 sm:col-span-2"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}
                  className="rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-sm text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20"
                >
                  {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-sm text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20"
                />
                <input
                  value={form.recipientName}
                  onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                  placeholder="Whose occasion? (optional)"
                  className="rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-sm text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20 sm:col-span-2"
                />
              </div>
              <p className="mt-2 text-xs text-ink-mut">We only use the day &amp; month — reminders repeat every year.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={save} disabled={busy} className="btn-accent text-sm disabled:opacity-50">{busy ? "Saving…" : "Save occasion"}</button>
                <button onClick={() => { setAdding(false); setForm({ ...BLANK }); }} className="btn-line text-sm">Cancel</button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-line text-sm">
          <Plus className="h-4 w-4" /> Add an occasion
        </button>
      )}
    </div>
  );
}
