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
| `NEXT_PUBLIC_SITE_URL` | For OG metadata | e.g. `https://www.thetastemakerrs.com` |

**After adding/changing any env var in Vercel → always confirm all vars are still present for Production scope before redeploying.**

## Key files
- `lib/products.ts` — product catalog (source of truth for prices)
- `lib/format.ts` — `formatINR(n)` currency formatter, use everywhere prices are displayed
- `lib/checkout-token.ts` — OTP JWT sign/verify, `contactMatches`, `CHECKOUT_COOKIE`
- `lib/notify.ts` — `otpEnabled()`, `emailConfigured()`, `smsConfigured()`, email/SMS templates
- `components/SmoothScroll.tsx` — LazyMotion `domMax` provider + Lenis + MotionConfig
- `components/ui/CartToast.tsx` — branded "Added to cart" toast (uses `m`, position top-right)
- `components/checkout/OtpDialog.tsx` — OTP dialog with success animation (pulsing rings + spring checkmark, 1600ms then onVerified)

## Commit style
- Never add `Co-Authored-By: Claude` trailer to commits
