import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildProductSocialMeta, socialMetaToHtml } from "../../../shared/socialMeta.js";
import { getStoreConfig } from "../../lib/storeSettings.js";
import { getProductById } from "../../lib/products.js";
import { getSiteOrigin } from "../../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "missing_product_id" });
  }

  const product = await getProductById(id);
  if (!product) {
    return res.status(404).json({ error: "product_not_found" });
  }

  const config = await getStoreConfig();
  const origin = getSiteOrigin(req);
  const meta = buildProductSocialMeta({
    origin,
    productId: product.id,
    productName: product.name,
    productDescription: product.description,
    imageUrl: product.imageUrl,
    locale: config.defaultLocale,
    defaultLocale: config.defaultLocale,
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return res.status(200).send(socialMetaToHtml(meta));
}
