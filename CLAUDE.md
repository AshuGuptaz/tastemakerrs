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

### Pricing sync (MUST keep identical)
Delivery/coupon rules are duplicated in TWO places — edit both or charge ≠ display:
- **Client display**: `app/checkout/page.tsx` → `couponValue()` + `delivery = subtotal >= 999 ? 0 : 79`
- **Server authority**: `app/api/orders/route.ts` → same `couponValue()` + `DELIVERY_FEE=79` / `FREE_DELIVERY_ABOVE=999`

Coupon codes: `FIRSTBITE` (10%), `BDAY150` (≥₹999 → ₹150), `HAMPER20` (20%), `BULK10` (≥₹3000 → 10%). Qty capped at 50 client (`CartContext MAX_QTY`) and server (`ItemSchema max(50)`).

### OTP checkout token flow
1. `/api/otp/send` → stores hashed code in MongoDB, sends via Resend/Fast2SMS
2. `/api/otp/verify` → verifies HMAC, marks consumed, sets `ttm_checkout_token` cookie (httpOnly, secure, sameSite=lax, 20 min, signed with `OTP_JWT_SECRET`)
3. `/api/orders` AND `/api/razorpay/create-order` both check `contactMatches(token, address)` — fail closed (401) if missing
4. OTP is only enforced when `otpEnabled()` = true: production + (Resend or SMS key configured)

### Server-side price authority
`/api/orders` reprices every item from `lib/products.ts` PRODUCTS catalog. Client-sent `price`/`total` are ignored. Non-catalog items need a `custom` payload or are rejected.

### Payment flow
Razorpay: `/api/razorpay/create-order` (loads total from DB) → Razorpay modal → `/api/razorpay/verify` (HMAC check, idempotent)
Stripe: `/api/stripe/create-checkout` → redirect → `/api/stripe/webhook` (idempotent via `findOneAndUpdate { paymentStatus: { $ne: "paid" } }`)

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
