import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSocialMetaDocument } from "../../../shared/socialMeta.js";
import { getProductSocialMeta, getRequestOrigin } from "../../lib/socialMeta.js";
import { hasDatabase } from "../../lib/db.js";
import { json, methodNotAllowed } from "../../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  const id = req.query.id;
  if (typeof id !== "string" || !id.trim()) {
    return json(res, 400, { error: "missing_product_id" });
  }

  try {
    const origin = getRequestOrigin(req);
    const meta = await getProductSocialMeta(origin, id.trim());
    if (!meta) {
      return json(res, 404, { error: "product_not_found" });
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(buildSocialMetaDocument(meta));
  } catch (err) {
    console.error("meta_product_error", err);
    res.status(500).send("error");
  }
}
