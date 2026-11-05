/**
 * Review photos are stored inline in Mongo as base64 data URLs (size-capped), but
 * must NEVER be sent inline in list responses: a product with a few photo
 * reviews made GET /api/reviews multi-megabyte (up to ~3.6MB per review), loaded
 * on every product-page view. Lists now carry small URLs and the browser fetches
 * each image separately (cacheable) from /api/reviews/photo/:id/:index.
 */

/** Raster formats only. SVG is deliberately excluded: served from our own origin it could carry script. */
const DATA_URL = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

export function parsePhotoDataUrl(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const m = DATA_URL.exec(dataUrl);
  if (!m) return null;
  const bytes = Buffer.from(m[2], "base64");
  return bytes.length > 0 ? { mime: m[1], bytes } : null;
}

/** True if a submitted photo is an acceptable raster data URL. */
export const isAllowedPhotoDataUrl = (s: string): boolean => parsePhotoDataUrl(s) !== null;

/** Stable URL for photo `index` of a review; `v` (updatedAt ms) busts caches when a review is edited. */
export function reviewPhotoUrl(reviewId: string, index: number, version?: number | Date | string): string {
  const v = version ? `?v=${new Date(version).getTime()}` : "";
  return `/api/reviews/photo/${reviewId}/${index}${v}`;
}

export function reviewPhotoUrls(reviewId: string, count: number, version?: number | Date | string): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => reviewPhotoUrl(reviewId, i, version));
}
