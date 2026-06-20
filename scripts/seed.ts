/**
 * Seeds the MongoDB Product collection from lib/products.ts.
 * Usage:  npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import { PRODUCTS } from "../lib/products";
import { Product } from "../models/Product";

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
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
