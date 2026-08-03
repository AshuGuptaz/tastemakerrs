"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { AddressDTO } from "@/lib/account-serialize";

const BLANK = { label: "Home", name: "", phone: "", street: "", city: "", state: "", pincode: "", notes: "", isDefault: false };

export default function AddressBook({ addresses, onChanged }: { addresses: AddressDTO[]; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.name || !form.street || !form.city || !form.state || !form.pincode) {
      return toast.error("Please fill in every field.");
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error("Enter a valid 10-digit mobile number");
    setBusy(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      toast.success("Address saved!");
      setForm({ ...BLANK });
      setAdding(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the address.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Address removed");
      onChanged();
    } catch {
      toast.error("Could not remove the address.");
    }
  };

  const field = (key: keyof typeof form, placeholder: string, extra?: string) => (
    <input
      value={form[key] as string}
      onChange={(e) => setForm((f) => ({ ...f, [key]: key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }))}
      placeholder={placeholder}
      className={`rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-sm text-ink focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/20 ${extra ?? ""}`}
    />
  );

  return (
    <div className="space-y-3">
      {addresses.length === 0 && !adding && (
        <p className="text-sm text-ink-mut">No saved addresses yet — add one for faster checkout.</p>
      )}

      {addresses.map((a) => (
        <div key={a._id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{a.label || "Address"}</span>
                {a.isDefault && (
                  <span className="flex items-center gap-1 rounded-pill bg-flame/10 px-2 py-0.5 text-[0.65rem] font-semibold text-flame-700">
                    <Star className="h-2.5 w-2.5 fill-current" /> Default
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink-soft">{a.name} · {a.phone}</p>
              <p className="text-sm text-ink-mut">{a.street}, {a.city}, {a.state} {a.pincode}</p>
            </div>
          </div>
          <button onClick={() => remove(a._id)} aria-label="Remove address" className="text-ink-mut transition-colors hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <AnimatePresence initial={false}>
        {adding && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-line bg-cream-50/60 p-4">
              <div className="grid grid-cols-2 gap-2.5">
                {field("label", "Label (Home / Office)")}
                {field("name", "Recipient name")}
                {field("phone", "10-digit mobile")}
                {field("pincode", "Pincode")}
                {field("street", "Street address", "col-span-2")}
                {field("city", "City")}
                {field("state", "State")}
              </div>
              <label className="mt-2.5 flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-line text-flame focus:ring-flame/30"
                />
                Set as default
              </label>
              <div className="mt-3 flex gap-2">
                <button onClick={save} disabled={busy} className="btn-accent text-sm disabled:opacity-50">{busy ? "Saving…" : "Save address"}</button>
                <button onClick={() => { setAdding(false); setForm({ ...BLANK }); }} className="btn-line text-sm">Cancel</button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-line text-sm">
          <Plus className="h-4 w-4" /> Add an address
        </button>
      )}
    </div>
  );
}
