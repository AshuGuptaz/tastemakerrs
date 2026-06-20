import Razorpay from "razorpay";

let _client: Razorpay | null = null;

export function getRazorpay() {
  if (_client) return _client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local");
  }
  _client = new Razorpay({ key_id, key_secret });
  return _client;
}
