"use client";

import { useState } from "react";
import { LogOut, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCustomer } from "@/context/CustomerContext";
import SignInCard from "@/components/account/SignInCard";
import OrderHistory from "@/components/account/OrderHistory";
import AddressBook from "@/components/account/AddressBook";
import OccasionsManager from "@/components/account/OccasionsManager";

export default function AccountPage() {
  const { customer, loading, signedIn, refresh, logout } = useCustomer();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  if (loading) {
    return (
      <div className="container-x flex min-h-[50vh] items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-flame" />
      </div>
    );
  }

  if (!signedIn || !customer) {
    return <SignInCard onSignedIn={refresh} />;
  }

  const saveName = async () => {
    const name = nameDraft.trim();
    if (!name) return setEditingName(false);
    setSavingName(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      toast.success("Name updated");
      setEditingName(false);
      refresh();
    } catch {
      toast.error("Could not update your name.");
    } finally {
      setSavingName(false);
    }
  };

  const greeting = customer.name ? customer.name.split(" ")[0] : "there";

  return (
    <div className="container-x py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="t-eyebrow text-flame">Your account</p>
          <div className="mt-1 flex items-center gap-3">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="rounded-xl border border-line bg-cream-50 px-3 py-1.5 font-display text-2xl font-semibold text-ink focus:border-flame focus:outline-none"
                />
                <button onClick={saveName} disabled={savingName} aria-label="Save name" className="text-flame"><Check className="h-5 w-5" /></button>
                <button onClick={() => setEditingName(false)} aria-label="Cancel" className="text-ink-mut"><X className="h-5 w-5" /></button>
              </div>
            ) : (
              <>
                <h1 className="font-display text-3xl font-semibold tracking-tighter2 text-ink md:text-4xl">Hi, {greeting} 👋</h1>
                <button
                  onClick={() => { setNameDraft(customer.name); setEditingName(true); }}
                  aria-label="Edit name"
                  className="text-ink-mut transition-colors hover:text-flame"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-mut">
            {customer.phone && <span>{customer.phone}</span>}
            {customer.phone && customer.email && <span> · </span>}
            {customer.email && <span>{customer.email}</span>}
          </p>
        </div>
        <button onClick={() => { logout(); toast.success("Signed out"); }} className="btn-line text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="t-h3 mb-4">Order history</h2>
          <OrderHistory />
        </section>

        <div className="space-y-10">
          <section>
            <h2 className="t-h3 mb-4">Saved addresses</h2>
            <AddressBook addresses={customer.addresses} onChanged={refresh} />
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="t-h3">Occasions</h2>
              <span className="rounded-pill bg-flame/10 px-2.5 py-0.5 text-xs font-semibold text-flame-700">We&apos;ll remind you</span>
            </div>
            <OccasionsManager occasions={customer.occasions} onChanged={refresh} />
          </section>
        </div>
      </div>
    </div>
  );
}
