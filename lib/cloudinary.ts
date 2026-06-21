/**
 * Signed Cloudinary image upload via the REST API (no SDK). Env-gated on
 * CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET. Returns
 * the secure_url on success, or null if unconfigured / on any error.
 */
import crypto from "crypto";
import { captureError } from "./logger";

const FOLDER = "ttm/custom-orders";

export async function uploadImage(dataUrl: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret || !dataUrl) return null;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    // Signature: sorted "key=value" params joined by &, then API secret appended, sha1.
    const params: Record<string, string | number> = {
      folder: FOLDER,
      timestamp,
    };
    const sortedParamString = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    const signature = crypto
      .createHash("sha1")
      .update(sortedParamString + apiSecret)
      .digest("hex");

    const form = new FormData();
    form.append("file", dataUrl);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", FOLDER);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      captureError(new Error(`cloudinary status ${res.status}`), {
        scope: "cloudinary.uploadImage",
        body,
      });
      return null;
    }
    const json = await res.json();
    return json?.secure_url ?? null;
  } catch (err) {
    captureError(err, { scope: "cloudinary.uploadImage" });
    return null;
  }
}
