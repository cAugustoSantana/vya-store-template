import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MAX_PRODUCT_IMAGES, sanitizePersistedImageUrl, shouldProxyBlobUrl } from "../../../shared/imageUrl.js";
import { fetchBlobImage } from "../../lib/blob.js";
import { getProductById } from "../../lib/products.js";
import { methodNotAllowed } from "../../lib/http.js";

function readImageIndex(value: string | string[] | undefined): number | null {
  if (value === undefined) return 0;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return 0;
  if (!/^\d+$/.test(raw)) return null;
  const index = Number(raw);
  if (index >= MAX_PRODUCT_IMAGES) return null;
  return index;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  const id = req.query.id;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "missing_product_id" });
  }

  const index = readImageIndex(req.query.i);
  if (index === null) {
    return res.status(400).json({ error: "invalid_image_index" });
  }

  try {
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "product_not_found" });
    }

    const imageUrl = product.imageUrls[index];
    if (!imageUrl) {
      return res.status(404).json({ error: "image_not_found" });
    }

    const persistedUrl = sanitizePersistedImageUrl(imageUrl, "");
    if (!persistedUrl) {
      return res.status(404).json({ error: "image_not_found" });
    }

    if (!shouldProxyBlobUrl(persistedUrl)) {
      return res.redirect(302, persistedUrl);
    }

    const { buffer, contentType } = await fetchBlobImage(persistedUrl);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("product_image_error", err);
    return res.status(404).json({ error: "image_not_found" });
  }
}
