/**
 * Seeds the MongoDB Product collection from lib/products.ts.
 * Usage:  npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import { PRODUCTS } from "../lib/products";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";

const COUPONS = [
  { code: "FIRSTBITE", type: "percent", value: 10, minSubtotal: 0 },
  { code: "BDAY150", type: "flat", value: 150, minSubtotal: 999 },
  { code: "HAMPER20", type: "percent", value: 20, minSubtotal: 0 },
  { code: "BULK10", type: "percent", value: 10, minSubtotal: 3000 },
] as const;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected. Seeding...");
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS.map((p) => ({ ...p, active: true })));
  console.log(`Seeded ${PRODUCTS.length} products.`);

  await Coupon.bulkWrite(
    COUPONS.map((c) => ({
      updateOne: {
        filter: { code: c.code },
        update: { $set: { ...c, active: true } },
        upsert: true,
      },
    }))
  );
  console.log(`Seeded ${COUPONS.length} coupons.`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
