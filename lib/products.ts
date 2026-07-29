import type { Product, Category } from "@/types/product";

/**
 * Master product catalog.
 *
 * Each product uses a real food photograph stored under
 *   /public/images/<category>/<name>.jpg
 * (free-license placeholders from Wikimedia Commons — see /public/images/CREDITS.md).
 * Swap in your own brand photography by replacing the file at the same path.
 *
 * The product card, detail page, cart and checkout auto-detect a value that
 * starts with "/" or "http" and render it with object-cover. `next.config.mjs`
 * whitelists remote hosts if you prefer hosting images on a CDN.
 */

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const make = (
  name: string,
  category: Category,
  price: number,
  partial: Partial<Product> = {}
): Product => ({
  id: slugify(name),
  slug: slugify(name),
  name,
  category,
  price,
  unit: partial.unit,
  description:
    partial.description ||
    "Handcrafted in small batches with premium ingredients. Eggless on request.",
  flavors: partial.flavors || [],
  bestseller: partial.bestseller || false,
  eggless: partial.eggless ?? true,
  customizable: partial.customizable ?? false,
  image: partial.image || "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80",
  bg: partial.bg || "bg-cream-100",
});

export const PRODUCTS: Product[] = [
  // ===== CAKES (per 500g, customizable) =====
  make("Truffle", "cakes", 650, { unit: "500g", flavors: ["chocolate"], image: "/images/gallery/choco-drip.jpg", bg: "bg-cocoa-50", customizable: true, bestseller: true,
    description: "Dark chocolate sponge soaked in ganache and finished with a glossy drip — for anyone who thinks more chocolate is always the right answer." }),
  make("Rich Chocolate", "cakes", 550, { unit: "500g", flavors: ["chocolate"], image: "/images/gallery/choco-drip.jpg", bg: "bg-cocoa-50", customizable: true,
    description: "Deep, moist chocolate sponge under a fudgy chocolate buttercream — the classic, done properly." }),
  make("Seasonal Fresh Fruit", "cakes", 600, { unit: "500g", flavors: ["fruit", "vanilla"], image: "/images/gallery/birthday-cake.jpg", bg: "bg-peach-100", customizable: true,
    description: "Vanilla sponge layered with whipped cream and whatever fruit is at its best this week — never the tinned stuff." }),
  make("Classic Pineapple", "cakes", 500, { unit: "500g", flavors: ["pineapple"], image: "/images/gallery/anniversary-cake.png", bg: "bg-cream-100", customizable: true,
    description: "Featherlight vanilla sponge, fresh cream and pineapple — the birthday-party classic that never goes out of style." }),
  make("Rasmalai Fusion", "cakes", 650, { unit: "500g", flavors: ["rasmalai", "kesar"], image: "/images/gallery/silver-jubilee.jpg", bg: "bg-peach-100", customizable: true, bestseller: true,
    description: "Saffron-soaked sponge layered with thickened malai and pistachio crunch — our most-loved Indian fusion cake." }),
  make("Luxury Pistachio", "cakes", 876, { unit: "500g", flavors: ["pistachio"], image: "/images/gallery/lily-cake.jpg", bg: "bg-sky-100", customizable: true, bestseller: true,
    description: "Delicate pistachio sponge folded with real pistachio paste under a light mascarpone cream — nutty, not overly sweet." }),
  make("Blueberry Burst", "cakes", 655, { unit: "500g", flavors: ["blueberry"], image: "/images/gallery/blueberry-cake.jpg", bg: "bg-sky-100", customizable: true,
    description: "Vanilla sponge layered with blueberry compote and fresh cream, topped with a burst of berries — as good as it looks." }),
  make("Crunchy Butterscotch", "cakes", 500, { unit: "500g", flavors: ["butterscotch"], image: "/images/gallery/birthday-cake.jpg", bg: "bg-cream-100", customizable: true,
    description: "Caramelised butterscotch sponge with praline crunch folded through the cream — the tin that empties first at every party." }),
  make("Strawberry Shortcake", "cakes", 500, { unit: "500g", flavors: ["strawberry"], image: "/images/gallery/heart-anniversary.jpg", bg: "bg-peach-100", customizable: true, bestseller: true,
    description: "Airy vanilla sponge, whipped cream and fresh strawberries, stacked simple and honest — no shortcuts." }),
  make("Red Velvet Royale", "cakes", 650, { unit: "500g", flavors: ["red velvet"], image: "/images/gallery/floral-birthday.jpg", bg: "bg-peach-100", customizable: true, bestseller: true,
    description: "Classic red velvet sponge with a cocoa hush, under a cream cheese frosting that's tangy, not sickly-sweet." }),
  make("Pinata Cake", "cakes", 1500, { unit: "500g", flavors: ["chocolate", "surprise"], image: "/images/gallery/butterfly-birthday.jpg", bg: "bg-peach-200", customizable: true, bestseller: true,
    description: "Smash-style chocolate shell hiding a treasure of candies inside — perfect for parties and birthdays." }),

  // ===== MUFFINS (per piece) =====
  make("Vanilla Muffin", "muffins", 60, { unit: "Per piece", flavors: ["vanilla"], image: "https://images.unsplash.com/photo-1723638174646-5322cd088233?auto=format&fit=crop&w=900&q=80", bg: "bg-cream-100",
    description: "A simple, buttery vanilla muffin, soft in the centre — the one you reach for with your morning chai." }),
  make("Tutti Frutti Muffin", "muffins", 65, { unit: "Per piece", flavors: ["tutti frutti"], image: "https://images.unsplash.com/photo-1659549591823-c6efec55b82f?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-100",
    description: "Vanilla batter studded with candied tutti frutti — the nostalgic bakery-counter favourite." }),
  make("Triple Chocolate Muffin", "muffins", 69, { unit: "Per piece", flavors: ["chocolate"], image: "/images/muffins/chocolate-muffin.jpg", bg: "bg-cocoa-50", bestseller: true,
    description: "Chocolate batter loaded with dark, milk and white chocolate chips — for people who don't believe in \"too much chocolate.\"" }),
  make("Chocolate Chunk Muffin", "muffins", 79, { unit: "Per piece", flavors: ["chocolate"], image: "/images/muffins/muffin.jpg", bg: "bg-cocoa-50",
    description: "Rich cocoa batter packed with chunky chocolate — dense, fudgy, and gone in four bites." }),
  make("Strawberry Muffin", "muffins", 79, { unit: "Per piece", flavors: ["strawberry"], image: "/images/muffins/muffin.jpg", bg: "bg-peach-100",
    description: "Soft vanilla batter swirled with real strawberry — bright and fruity, never artificial-tasting." }),
  make("Dark Double Chocolate Muffin", "muffins", 89, { unit: "Per piece", flavors: ["chocolate"], image: "/images/muffins/chocolate-muffin.jpg", bg: "bg-cocoa-50", bestseller: true,
    description: "Intensely dark cocoa batter with extra dark chocolate chunks — for the serious chocolate lover only." }),
  make("Blueberry Muffin", "muffins", 89, { unit: "Per piece", flavors: ["blueberry"], image: "/images/muffins/blueberry-muffin.jpg", bg: "bg-sky-100",
    description: "Classic vanilla batter, bursting with juicy blueberries in every bite." }),
  make("Nutella Hazelnut Muffin", "muffins", 90, { unit: "Per piece", flavors: ["hazelnut", "chocolate"], image: "/images/muffins/muffin.jpg", bg: "bg-peach-100", bestseller: true,
    description: "Nutella swirled through a hazelnut batter with a gooey, molten centre — this one needs a napkin." }),
  make("Pistachio Muffin", "muffins", 120, { unit: "Per piece", flavors: ["pistachio"], image: "https://images.unsplash.com/photo-1723638174646-5322cd088233?auto=format&fit=crop&w=900&q=80", bg: "bg-sky-100",
    description: "Nutty pistachio batter with a delicate crumb — a quieter, more grown-up muffin." }),

  // ===== COOKIES =====
  make("Choco Chip Cookie", "cookies", 180, { unit: "Box of 6", flavors: ["chocolate"], image: "/images/cookies/choc-chip.jpg", bg: "bg-cocoa-50",
    description: "Thick, chewy-centred cookies loaded with chocolate chips — crisp at the edge, gooey in the middle." }),
  make("Oats & Raisin Cookie", "cookies", 200, { unit: "Box of 6", flavors: ["oats"], image: "/images/cookies/oatmeal.jpg", bg: "bg-cream-100",
    description: "Hearty oat cookies studded with plump raisins — the wholesome one that still tastes like a treat." }),

  // ===== CHOCOLATES =====
  make("Hazelnut Pralines", "chocolates", 450, { unit: "Box of 12", flavors: ["hazelnut"], image: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=900&q=80", bg: "bg-cocoa-50", bestseller: true,
    description: "Smooth hazelnut praline shells, hand-tempered — a proper box of chocolates, not a supermarket assortment." }),
  make("Dark Chocolate Bark", "chocolates", 380, { unit: "200g", flavors: ["dark chocolate"], image: "https://images.unsplash.com/photo-1569896254409-ac66c17041d2?auto=format&fit=crop&w=900&q=80", bg: "bg-cocoa-50",
    description: "Thick dark chocolate slabs, hand-broken and studded with nuts — bitter, snappy, unapologetically dark." }),
  make("Truffle Bonbons", "chocolates", 520, { unit: "Box of 9", flavors: ["chocolate"], image: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?auto=format&fit=crop&w=900&q=80", bg: "bg-cocoa-50", bestseller: true,
    description: "Silky ganache truffles, hand-rolled and dusted in cocoa — the kind of chocolate you save for later, then don't." }),

  // ===== JARS =====
  make("Tiramisu Jar", "jars", 220, { unit: "150ml", flavors: ["coffee"], image: "https://images.unsplash.com/photo-1564844536308-75c540dbf14e?auto=format&fit=crop&w=900&q=80", bg: "bg-cocoa-50", bestseller: true,
    description: "Espresso-soaked sponge layered with mascarpone cream and a dusting of cocoa — a proper tiramisu, just in a jar." }),
  make("Red Velvet Jar", "jars", 240, { unit: "150ml", flavors: ["red velvet"], image: "https://images.unsplash.com/photo-1659549591823-c6efec55b82f?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-100",
    description: "Layers of red velvet crumb and cream cheese frosting in a jar — all the cake, none of the cutlery." }),
  make("Brownie Cheesecake Jar", "jars", 260, { unit: "150ml", flavors: ["chocolate"], image: "https://images.unsplash.com/photo-1569896254409-ac66c17041d2?auto=format&fit=crop&w=900&q=80", bg: "bg-cream-100",
    description: "Fudgy brownie chunks folded through a creamy cheesecake layer — rich enough to share, though you won't want to." }),
  make("Mango Cheesecake Jar", "jars", 250, { unit: "150ml", flavors: ["mango"], image: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-100",
    description: "Silky mango cheesecake layered with real mango pulp — sweet, tangy, and thoroughly seasonal." }),

  // ===== HAMPERS =====
  make("Sweet Memories Hamper", "hampers", 1499, { unit: "Box", flavors: ["mixed"], image: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-200", bestseller: true,
    description: "Curated mini bento cake, 4 cupcakes, 6 cookies and a chocolate bar — perfect gift box." }),
  make("Festive Premium Hamper", "hampers", 2499, { unit: "Box", flavors: ["mixed"], image: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=900&q=80", bg: "bg-sky-100", bestseller: true,
    description: "Full-size cake, 6 cupcakes, 6 muffins, 12 pralines and 2 dessert jars in a luxe gift box." }),
  make("Corporate Diwali Box", "hampers", 1999, { unit: "Box", flavors: ["mixed"], image: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-100",
    description: "Eggless hamper for corporate gifting. Custom branding available on the box." }),
];

export function getByCategory(cat: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export function getBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getBestsellers(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.bestseller).slice(0, limit);
}

export const CATEGORY_META: Record<Category, { label: string; description: string; emoji: string }> = {
  cakes:      { label: "Cakes",      description: "Layered, frosted, made for memories.",       emoji: "🎂" },
  muffins:    { label: "Muffins",    description: "Soft, fluffy, perfect with chai.",            emoji: "🧁" },
  cookies:    { label: "Cookies",    description: "Crunchy outside, chewy inside.",              emoji: "🍪" },
  chocolates: { label: "Chocolates", description: "Bonbons, pralines, barks. Pure indulgence.",  emoji: "🍫" },
  jars:       { label: "Dessert Jars", description: "Layered jars to go.",                       emoji: "🍮" },
  hampers:    { label: "Hampers",    description: "Curated gift boxes for every occasion.",      emoji: "🎁" },
};

export const CATEGORIES: Category[] = ["cakes", "muffins", "cookies", "chocolates", "jars", "hampers"];

export const ALL_FLAVORS = Array.from(new Set(PRODUCTS.flatMap((p) => p.flavors))).sort();
