import { Product } from "@/models/Product";
import { logger, captureError } from "@/lib/logger";

/**
 * Atomically decrements stock for inventory-tracked products.
 * Catalog products use `slug` as their id. Only decrements where
 * trackInventory === true and stock >= qty. Never throws.
 */
export async function decrementStock(
  items: Array<{ productId?: string; qty: number }>
): Promise<void> {
  try {
    for (const item of items) {
      if (!item.productId) continue;
      await Product.updateOne(
        { slug: item.productId, trackInventory: true, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
    }
  } catch (err) {
    captureError(err, { scope: "decrementStock" });
    logger.error("decrementStock failed");
  }
}
