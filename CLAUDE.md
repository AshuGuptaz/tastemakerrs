# The Taste Makerrs — Claude Context

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Framer Motion with **LazyMotion `domMax`** (required — `layoutId` and `layout` props need it; do NOT downgrade to `domAnimation`)
- Always use `m` (not `motion`) for JSX elements; `motion` is only for portals outside the LazyMotion context
- MongoDB + Mongoose, Razorpay + Stripe, OTP via Resend (email) + Fast2SMS (SMS)
- Lenis smooth scroll (duration 1.2, wheelMultiplier 0.9, touchMultiplier 1.8)

## Design tokens
- **Fonts**: Fraunces (`font-display`, variable serif for headings/prices/wordmark) + Inter (`font-sans`, body)
- **Palette**: `#FBF8F3` canvas · `#D67A47` flame · `#1C1714` ink
- **Classes**: `bg-canvas`, `bg-surface`, `text-flame`, `text-ink`, `text-ink-mut`, `border-line`, `shadow-e1/e2/e3`, `btn-accent`, `btn-line`, `rounded-pill`, `focus-ring`
- Grain texture via `.grain` on `<body>`

## Critical architecture rules

### Pricing (single source of truth)
Delivery/coupon/total math lives ONLY in `lib/pricing.ts` (`couponValue`, `deliveryFee`, `computeTotals`, `DELIVERY_FEE=79`, `FREE_DELIVERY_ABOVE=999`). Both the client display (`app/checkout/page.tsx`) and the server authority (`app/api/orders/route.ts`) import from it — never re-implement the math inline (that duplication used to cause charge ≠ display). Custom-cake pricing is likewise centralized in `lib/custom-cake.ts` (`priceCustomCake`, `customCakeName`), imported by the studio page and re-derived server-side in `/api/orders`. Tests in `tests/*.test.ts` lock these invariants (`npm test`).

`/api/orders` returns `{ subtotal, delivery, discount, total }`; checkout reconciles them against the displayed total before opening the payment modal (catches stale cart prices → no surprise charge).

Coupon codes: `FIRSTBITE` (10%), `BDAY150` (≥₹999 → ₹150), `HAMPER20` (20%), `BULK10` (≥₹3000 → 10%). Qty capped at 50 client (`CartContext MAX_QTY`) and server (`ItemSchema max(50)`).

### Rate limiting (shared, cross-instance)
`lib/rate-limit.ts` (`rateLimit(key, {limit, windowMs})`, `resetRateLimit`, `clientIp`) is backed by the `RateLimit` MongoDB collection (TTL-cleaned), so limits hold across serverless instances — not a per-lambda in-memory Map. Applied to admin login, OTP send (per-IP, on top of per-phone/email caps), contact, orders, and custom-orders. Fails OPEN on store errors. Use `lib/logger.ts` (`logError/logWarn/logInfo`, JSON, Sentry-ready) for server logs — no raw `console.error` in routes.

### OTP checkout token flow
1. `/api/otp/send` → stores hashed code in MongoDB, sends via Resend/Fast2SMS
2. `/api/otp/verify` → verifies HMAC, marks consumed, sets `ttm_checkout_token` cookie (httpOnly, secure, sameSite=lax, 20 min, signed with `OTP_JWT_SECRET`)
3. `/api/orders` AND `/api/razorpay/create-order` both check `contactMatches(token, address)` — fail closed (401) if missing
4. OTP is only enforced when `otpEnabled()` = true: production + (Resend or SMS key configured)

### Server-side price authority
`/api/orders` reprices every item from `lib/products.ts` PRODUCTS catalog. Client-sent `price`/`total` are ignored. Non-catalog items need a `custom` payload or are rejected.

### Payment flow
Razorpay: `/api/razorpay/create-order` (loads total from DB) → Razorpay modal → `/api/razorpay/verify` (client-side, HMAC check) AND `/api/razorpay/webhook` (server-to-server, independent of the browser — catches the case where the customer closes the tab right after paying). Both idempotent via `findOneAndUpdate { paymentStatus: { $in: ["unpaid", "failed"] } }` — deliberately not `{ $ne: "paid" }`, which would also match `"refunded"` and let a redelivered webhook resurrect a refund.
Stripe: `/api/stripe/create-checkout` → redirect → `/api/stripe/webhook` (same idempotency rule as above)

### Admin JWT
`ADMIN_JWT_SECRET` checked lazily inside `getSecret()` per-request, NEVER at module load (build-safe on Vercel Edge).

### Customer accounts (passwordless, OTP-based)
Accounts reuse the OTP infra — there are NO passwords. `/api/otp/verify` upserts a `Customer` (`models/Customer.ts`) and sets a 30-day session cookie (`ttm_customer_token`, `lib/customer-auth.ts`, `role: "customer"`, signed with `OTP_JWT_SECRET`). Identity is keyed STRICTLY on the **proven** channel (phone OR email); the unproven counterpart is stored as un-indexed `contactEmail`/`contactPhone` and is NEVER used for lookup — this prevents cross-channel account hijack. `verifyAdmin` rejects any non-`admin` role, so a customer token can't authenticate as admin. A valid customer session doubles as checkout proof (`/api/orders` accepts session OR checkout token via `contactMatches`) → one-tap reorder. `/account` (client, `CustomerProvider`) shows sign-in (`SignInCard`) or the dashboard (order history + reorder, address book, occasions). Account routes live under `app/api/account/*`.

### Gifting + delivery scheduling
`Order.gift` (recipient, message, hidePrices) and `Order.fulfillment` (date, slot) are set at checkout. `lib/fulfillment.ts` is the single source of truth for delivery slots + date validity — `/api/orders` re-validates the slot/date server-side. Gift/schedule are display-only and NEVER affect price.

### Reviews (verified-buyer, moderated)
`models/Review.ts` — one review per customer per product, defaults to `pending`. `/api/reviews` POST requires a signed-in customer with a **paid** order containing the product; photos are image data URLs, size-capped. Only `approved` reviews are public. Moderate at `/admin/reviews` (`/api/admin/reviews`).

### Live order tracking
`Order.statusHistory` records each transition. `updateOrderStatus` (`lib/order-status-update.ts`) is the ONLY path that should change status — it appends history and notifies the customer (email/SMS with a tracking link) for customer-facing transitions. Admin advances status via the dropdown on `/admin/orders` (`PATCH /api/admin/orders/:id`). `/track/:id` is a public capability link (`/api/track/:id` returns ONLY non-sensitive fields — no email/phone/address/totals; unpaid orders 404). `lib/order-status.ts` holds shared `STATUS_META`/`TRACK_STEPS`.

### Occasion reminders (cron)
Customers save birthdays/anniversaries (`Customer.occasions`, month+day). `/api/cron/reminders` (daily Vercel Cron, `vercel.json`, protected by `CRON_SECRET`) emails/SMSes ~7 days before; `lastRemindedYear` guarantees at-most-once-per-year even on a daily schedule, and it only marks reminded when a channel actually delivered.

## Vercel env vars (production)
| Var | Required | Notes |
|-----|----------|-------|
| `MONGODB_URI` | Yes | |
| `ADMIN_JWT_SECRET` | Yes | ≥32 chars, admin auth fails without it |
| `OTP_JWT_SECRET` | Yes | MUST differ from ADMIN_JWT_SECRET; otp/send returns 500 without it |
| `RAZORPAY_KEY_ID` | Yes | Live key (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Yes | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Separate secret from Razorpay Dashboard → Settings → Webhooks (URL: `/api/razorpay/webhook`, events: `payment.captured`, `payment.failed`, `payment.refunded`); `/api/razorpay/webhook` 400s without it |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Same as KEY_ID, needed by browser widget |
| `RESEND_API_KEY` | For email OTP/confirmations | |
| `FAST2SMS_API_KEY` | For SMS OTP | Needs ₹100 top-up before API works |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | For address autocomplete | Optional; checkout degrades gracefully |
| `NEXT_PUBLIC_SITE_URL` | For OG metadata + email/SMS tracking links | e.g. `https://www.thetastemakerrs.com` |
| `CRON_SECRET` | For occasion reminders | Vercel sends it as `Authorization: Bearer …` to `/api/cron/reminders`; the job 401s without a match in production |

**After adding/changing any env var in Vercel → always confirm all vars are still present for Production scope before redeploying.**

## Key files
- `lib/products.ts` — product catalog (source of truth for prices)
- `lib/format.ts` — `formatINR(n)` currency formatter, use everywhere prices are displayed
- `lib/checkout-token.ts` — OTP JWT sign/verify, `contactMatches`, `CHECKOUT_COOKIE`
- `lib/customer-auth.ts` / `lib/customer-server.ts` / `lib/customer.ts` — customer session JWT, cookie read, upsert helper
- `lib/fulfillment.ts` — delivery slots + date validity (client + server authority)
- `lib/order-status.ts` — shared status labels + tracking timeline; `lib/order-status-update.ts` — the status-change + notify path
- `lib/notify.ts` — `otpEnabled()`, `emailConfigured()`, `smsConfigured()`, email/SMS templates (OTP, order, status, reminder)
- `context/CustomerContext.tsx` — `useCustomer()` client sign-in state (wired into `app/layout.tsx`)
- `components/SmoothScroll.tsx` — LazyMotion `domMax` provider + Lenis + MotionConfig
- `components/ui/CartToast.tsx` — branded "Added to cart" toast (uses `m`, position top-right)
- `components/checkout/OtpDialog.tsx` — OTP dialog with success animation (pulsing rings + spring checkmark, 1600ms then onVerified)

## Commit style
- Never add `Co-Authored-By: Claude` trailer to commits
