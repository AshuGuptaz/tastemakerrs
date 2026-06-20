# Product Images

This folder is intentionally empty in the starter. The project uses **emoji + colored backgrounds** as zero-cost visual placeholders so it builds and runs without any copyrighted photography.

## When you have brand photos:

1. Drop product shots here as `<slug>.jpg` — e.g. `truffle.jpg`, `pinata-cake.jpg`.
2. Update each Product in `lib/products.ts` (or in the admin panel) — change the `image` field from an emoji to a path: `"/images/truffle.jpg"`.
3. In `components/ProductCard.tsx` and `app/product/[slug]/ProductDetail.tsx`, replace the `<motion.div>{image}</motion.div>` block with a `next/image` component.

## Recommended sizes
- Card thumbnails: 800×600 (4:3) — keep under 200 KB.
- Hero / detail: 1600×1600 square — under 350 KB after optimization.
- Hero floating cutouts: PNG with transparent background, ~1200 px wide.

## Tip
Use Cloudinary (already supported via remotePatterns in `next.config.mjs`) for on-the-fly resizing, or run images through https://squoosh.app before committing.
