# The Taste Makerrs — Premium Bakery Website

A production-ready Next.js 14 (App Router) bakery storefront with Razorpay (primary) and Stripe (fallback) checkout, MongoDB-backed catalog & orders, a basic admin panel, custom-cake builder, and a design system inspired by the **Sliced** bakery look — Anton + Roboto, cream + peach + soft blue with a flame-orange accent.

```
A CAKE FOR YOUR FAVORITE MEMORIES.
```

---

## ⚡ Stack

- **Framework:** Next.js 14 (App Router, RSC, route handlers)
- **Styling:** Tailwind CSS + custom design tokens
- **Animations:** Framer Motion
- **Database:** MongoDB Atlas (via Mongoose)
- **Payments:** Razorpay (UPI/cards/netbanking, India) + Stripe (international cards)
- **Auth:** Cookie-based JWT for admin (jose + bcryptjs). Guest checkout for customers.
- **Validation:** Zod
- **Deployment:** Vercel-ready

---

## 📂 Folder Structure

```
the-taste-makerrs/
├── app/
│   ├── layout.tsx               # Root layout — fonts, providers
│   ├── page.tsx                 # Homepage (Hero, Marquee, Occasions, Featured, Flavors, Reviews, Bento, CTA)
│   ├── globals.css              # Design tokens & component classes
│   ├── about/page.tsx           # Brand story
│   ├── menu/page.tsx            # Filterable shop
│   ├── product/[slug]/page.tsx  # Product detail (SSG)
│   ├── custom-cake/page.tsx     # Cake builder w/ dynamic pricing
│   ├── kitchen/page.tsx         # 6-step trust-building process
│   ├── offers/page.tsx          # Coupon codes
│   ├── contact/page.tsx         # Contact form
│   ├── cart/page.tsx
│   ├── checkout/page.tsx        # Razorpay + Stripe flows
│   ├── order-success/page.tsx
│   ├── privacy-policy/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx             # Dashboard with stats
│   │   ├── products/page.tsx    # CRUD UI
│   │   └── orders/page.tsx      # Orders viewer
│   └── api/
│       ├── products/            # GET (list), POST (create), PATCH/DELETE /:id
│       ├── orders/              # POST (create), GET (admin list)
│       ├── custom-orders/       # POST (custom cake quote)
│       ├── contact/
│       ├── razorpay/
│       │   ├── create-order/    # Server creates RZP order
│       │   └── verify/          # HMAC-verifies payment
│       ├── stripe/
│       │   ├── create-checkout/ # Stripe Checkout Session
│       │   └── webhook/         # checkout.session.completed
│       └── admin/login & logout
├── components/                  # Navbar, Footer, Hero, ProductCard, etc.
├── context/CartContext.tsx      # Cart in React Context + localStorage
├── lib/
│   ├── mongodb.ts               # Mongoose singleton
│   ├── products.ts              # Seed catalog (used as fallback if no DB)
│   ├── razorpay.ts / stripe.ts  # SDK singletons
│   └── auth.ts                  # JWT helpers
├── models/                      # Product / Order / CustomOrder schemas
├── scripts/seed.ts              # `npm run seed` to push catalog to MongoDB
├── middleware.ts                # Protects /admin/**
├── tailwind.config.ts
├── next.config.mjs
├── package.json
└── .env.example
```

---

## 🚀 Quick Start

```bash
# 1. install
npm install

# 2. configure
cp .env.example .env.local
# fill MONGODB_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, STRIPE_SECRET_KEY, etc.

# 3. (optional) seed the catalog into MongoDB
npm run seed

# 4. dev
npm run dev   # http://localhost:3000
```

Don't have a DB yet? The site runs without one — `lib/products.ts` is used as a fallback. Orders, custom-orders and admin features need a DB.

---

## 🔑 Generating an Admin Password Hash

```bash
node -e "console.log(require('bcryptjs').hashSync('YourStrongPassword',10))"
```

Paste the result into `ADMIN_PASSWORD_HASH` in `.env.local`.
Login at `/admin/login`.

---

## 💳 Payment Setup — Razorpay (primary)

1. Create account at https://dashboard.razorpay.com.
2. Settings → API Keys → **Generate Test Key**.
3. Copy `Key Id` and `Key Secret`.
4. Set in `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   ```
5. Test cards: see Razorpay docs (e.g. `4111 1111 1111 1111`, any future expiry, any CVV).
6. Flow:
   - `POST /api/razorpay/create-order` → creates RZP order on server.
   - Razorpay Checkout opens on the client.
   - On success, `POST /api/razorpay/verify` → HMAC-validates the signature → marks order paid.

## 💳 Payment Setup — Stripe (fallback / international)

1. Create account at https://dashboard.stripe.com.
2. Developers → API Keys → copy publishable & secret.
3. Set in `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # see step 4
   ```
4. Webhooks → Add endpoint → URL: `https://yourdomain.com/api/stripe/webhook` → events: `checkout.session.completed`, `charge.refunded`. Copy the signing secret.
5. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
6. Test cards: `4242 4242 4242 4242`, any future date, any CVV.

---

## ☁️ Deploy to Vercel

1. Push the repo to GitHub.
2. Go to https://vercel.com/new → import the repo.
3. Project Settings → Environment Variables → paste everything from `.env.example` (with real values).
4. Deploy. Done.
5. After first deploy:
   - Add your custom domain in Vercel → Domains.
   - Set `NEXT_PUBLIC_SITE_URL` to your live URL.
   - Add the live `/api/stripe/webhook` URL in your Stripe Dashboard.

---

## 🧁 Brand Guide

### Suggested logo concept

**Wordmark:** A **two-word stack**. The first word `Taste` set bold in **Anton** uppercase-ish, in deep wine (`#890F20`). The second word `makerrs` written underneath as a **handwritten script** in pink (`#F26A8D`) — Caveat or Allura works beautifully and stays free via Google Fonts.

Optional accent: tiny illustrated coffee bean / cherry / sprinkle florets next to the script word — like the reference logo provided.

Alternative monogram for app icons / Insta avatar:
A circular badge in deep wine with a script `t` in pink at the center.

### Color palette (locked to your spec)

| Role               | Hex       | Use                                 |
|--------------------|-----------|-------------------------------------|
| Cream Paper        | `#FDF0D5` | Page background, cards              |
| Cream Soft         | `#FFFAF1` | Header, raised surfaces             |
| Light Pink         | `#F49CBB` | Soft accent panels, occasions       |
| Pink (primary)     | `#F26A8D` | All CTAs, accent highlights, brand  |
| Rose (hover/sec.)  | `#C75A68` | Hover states, secondary accents     |
| Wine Deep (text)   | `#890F20` | Headings, body, dark surfaces       |
| Wine Darker        | `#5C0915` | Hover on dark backgrounds           |

These are wired into Tailwind under the original class names (`flame`, `cocoa`, `peach`, `cream`, `rose`) so every component picks them up automatically.

### Type system

- **Display / Headings**: Anton (Google Fonts) — uppercase, slight tightening.
- **Editorial subhead**: Playfair Display Italic — for product names like *"The Velvet Framboise"* style.
- **Script / brand mark / tagline**: Caveat — the handwritten "makerrs" feel.
- **Body / UI**: Roboto 400/500/700/900.
- All four loaded via `next/font/google` in `app/layout.tsx` — no FOUT, no extra CSS to wire.

### Product photography

The starter ships with curated **Unsplash bakery photos** in `lib/products.ts` (one URL per product). `next.config.mjs` whitelists `images.unsplash.com`, `res.cloudinary.com` and `cdn.pixabay.com` so they "just work."

When you have brand photography:
1. Drop product shots in `public/images/<slug>.jpg` (e.g. `public/images/truffle.jpg`).
2. Update each `image:` field in `lib/products.ts` (or via the admin panel) to `/images/<slug>.jpg`.
3. The render code (in `ProductCard.tsx`, `ProductDetail.tsx`, `cart/page.tsx`) auto-detects whether the value is a URL/path and renders an `<img>`, or treats it as an emoji glyph.

If a particular Unsplash URL ever 404s, just pick a replacement from https://unsplash.com/s/photos/cake and paste in the new ID.

### Tagline suggestions

- *"A cake for your favorite memories."* (hero, primary)
- *"Baked small, loved big."*
- *"Pure vanilla, pure joy. Pure veg."*
- *"Eggless never tasted this good."*
- *"Tiny kitchen, giant flavors."*

### Voice

Premium-but-warm, never stiff. We're the friendly home bakery that happens to plate like a pâtisserie — speak like a friend who happens to bake. Use sensory verbs (*whisked, layered, piped, rested*). Avoid corporate words (*solutions, offerings, leverage*).

---

## 📷 Instagram Strategy (first 90 days)

**Goal:** convert IG to a steady DM-order channel + drive traffic to `/menu`.

### Pillars (post mix)

1. **Eye candy (40%)** — overhead shot of the day's bake, slow-mo cake slice, frosting swirl close-ups.
2. **Story telling (20%)** — kitchen behind-the-scenes Reels: "How we make Rasmalai Fusion in 60 seconds".
3. **Customer love (15%)** — repost tagged photos, video unboxings, birthday smiles.
4. **Education (15%)** — eggless vs egg, why we use Belgian chocolate, Jain-friendly explainer carousel.
5. **Offers (10%)** — code drops (`FIRSTBITE`, `BDAY150`), festival pre-orders, limited drops.

### Cadence

- **3 feed posts/week** + 5 stories/day + 2–3 Reels/week.
- Highlights: *Menu, Custom Cakes, Reviews, Offers, Kitchen, FAQ, Order Now*.

### Content templates

- **Cake reveal Reel**: 0–2s intro clip (whisking) → 2–8s slice → 8–15s closeup with flavor list → CTA card "Order at thetastemakerrs.com".
- **Carousel** (10 slides): 1 hook → 8 product flavor breakdowns → 1 CTA.
- **Photo grid** every Sunday — 9-tile branded mosaic to keep the feed cohesive.

### Hashtag stacks (rotate sets of 30 per post)

```
#TheTasteMakerrs #BentoCake #EgglessCake #JainCake #MumbaiBakery #PuneBakery
#CakesOfInstagram #BakedFresh #CustomCakes #BirthdayCake #FoodPhotographyIndia
```

### Conversion mechanics

- Link-in-bio → `thetastemakerrs.com/menu` (or `/offers` during a campaign).
- Each post CTA: "Tap link in bio · same-day delivery in Mumbai/Pune".
- Story stickers: poll ("vanilla or chocolate?"), countdown (festive drops), question box weekly.
- Run `FIRSTBITE` only as a 24-hour story bomb to drive urgency.

### Collabs / growth

- Micro-influencer giveaways (1.5–25k followers, food + lifestyle accounts in your city) — give a hamper in exchange for an honest reel.
- Pair with florists / event planners for shared posts.

### KPIs (month 3)

- 10k followers · 5% engagement · 50 DMs/week · 30% of orders attributable to Instagram.

---

## 🛡️ Security notes

- **Cart state is client-side**, but **price is recomputed server-side** when you create the Razorpay/Stripe order — so a tampered client cart can't reduce the charge. Add the same recomputation to `app/api/orders/route.ts` before deploying.
- Razorpay payment is verified by HMAC SHA-256 of `order_id|payment_id` against the secret.
- Stripe payment is verified server-side via `checkout.session.completed` webhook.
- Admin routes are protected by `middleware.ts` + httpOnly JWT cookie; password is bcrypt-hashed.
- File uploads in custom-cake are size-capped (4 MB) and stored as data URLs — swap to Cloudinary or S3 for production.

---

## 🧪 Sanity checklist before going live

- [ ] Add real product photography to `/public/images/<slug>.jpg` and update `image` field on each Product (or admin-edit them).
- [ ] Replace `+91 90000 00000` and addresses in `Footer.tsx`, `contact/page.tsx`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your live domain.
- [ ] Generate a strong `ADMIN_JWT_SECRET` (`openssl rand -base64 48`).
- [ ] Lock CORS / rate-limit critical API routes (e.g. `@upstash/ratelimit`).
- [ ] Enable Razorpay live mode + add KYC details.
- [ ] Add Google / GA4 / Meta Pixel via `next/script` if needed.
- [ ] Set up email (Resend/SendGrid) and wire `/api/contact` and order confirmations.

---

## 📝 License

Source code is yours to use for **The Taste Makerrs**. Emoji/glyph placeholders are in the public domain; replace them with brand photography before launch.
