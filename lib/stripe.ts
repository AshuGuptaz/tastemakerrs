import Stripe from "stripe";

let _client: Stripe | null = null;

export function getStripe() {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _client = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  return _client;
}
