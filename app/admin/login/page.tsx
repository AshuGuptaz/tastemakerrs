"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Login failed");
      }
      toast.success("Welcome!");
      router.push("/admin");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid min-h-[80vh] place-items-center bg-cream-50 py-16">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl uppercase">ADMIN <span className="text-flame">LOGIN</span></h1>
        <p className="mt-2 text-sm text-cocoa/60">Restricted to authorized staff only.</p>
        <div className="mt-6 grid gap-4">
          <div><label className="label" htmlFor="admin-email">Email</label><input id="admin-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label" htmlFor="admin-password">Password</label><input id="admin-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button disabled={busy} className="btn-primary justify-center">{busy ? "Signing in..." : "Sign in"}</button>
        </div>
      </form>
    </section>
  );
}
