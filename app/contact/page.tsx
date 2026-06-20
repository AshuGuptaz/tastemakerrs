"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import Underlined from "@/components/Underlined";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [errorField, setErrorField] = useState<"name" | "email" | "message" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setErrorField("name"); toast.error("Please fill name, email and message"); return; }
    if (!form.email) { setErrorField("email"); toast.error("Please fill name, email and message"); return; }
    if (!form.message) { setErrorField("message"); toast.error("Please fill name, email and message"); return; }
    setBusy(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Message sent — we'll be in touch!");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Could not send — try WhatsApp.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="bg-cream-100 py-16 md:py-24">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <p className="pill">Say hello</p>
            <h1 className="display mt-3 text-[clamp(2.5rem,7vw,5.5rem)]">
              LET'S MAKE <Underlined>SWEET</Underlined> PLANS
            </h1>
            <p className="mt-4 text-cocoa/70">For custom cakes, bulk orders, weddings and corporate gifting — drop us a note and we'll be back in 2 hours.</p>

            {/* TODO: replace with your real shop address, phone and email before launch */}
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-flame" /> Shop 14, Linking Road, Bandra West, Mumbai 400050</li>
              <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-flame" /> <a href="tel:+919876543210" className="hover:text-flame">+91 98765 43210</a> (WhatsApp preferred)</li>
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-flame" /> <a href="mailto:hello@thetastemakerrs.com" className="hover:text-flame">hello@thetastemakerrs.com</a></li>
            </ul>
          </div>

          <form onSubmit={submit} className="card p-6 md:p-8">
            <div className="grid gap-4">
              <div><label className="label" htmlFor="contact-name">Name</label><input id="contact-name" required aria-required="true" aria-invalid={errorField === "name"} className={`input ${errorField === "name" ? "ring-2 ring-flame/50" : ""}`} value={form.name} onChange={(e) => { setErrorField(null); setForm({ ...form, name: e.target.value }); }} /></div>
              <div><label className="label" htmlFor="contact-email">Email</label><input id="contact-email" type="email" required aria-required="true" aria-invalid={errorField === "email"} className={`input ${errorField === "email" ? "ring-2 ring-flame/50" : ""}`} value={form.email} onChange={(e) => { setErrorField(null); setForm({ ...form, email: e.target.value }); }} /></div>
              <div><label className="label" htmlFor="contact-phone">Phone</label><input id="contact-phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label" htmlFor="contact-message">Message</label><textarea id="contact-message" rows={5} required aria-required="true" aria-invalid={errorField === "message"} className={`input ${errorField === "message" ? "ring-2 ring-flame/50" : ""}`} value={form.message} onChange={(e) => { setErrorField(null); setForm({ ...form, message: e.target.value }); }} /></div>
              <button disabled={busy} className="btn-primary justify-center">{busy ? "Sending..." : "Send Message"}</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
