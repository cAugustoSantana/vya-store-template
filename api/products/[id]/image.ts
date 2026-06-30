import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sanitizePersistedImageUrl, shouldProxyBlobUrl } from "../../../shared/imageUrl.js";
import { fetchBlobImage } from "../../lib/blob.js";
import { getProductImageUrl } from "../../lib/products.js";
import { methodNotAllowed } from "../../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  const id = req.query.id;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "missing_product_id" });
  }

  try {
    const imageUrl = await getProductImageUrl(id);
    if (!imageUrl) {
      return res.status(404).json({ error: "product_not_found" });
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
