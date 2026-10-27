import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db.js";
import { requireAdmin } from "../../lib/auth.js";
import { reorderProducts } from "../../lib/products.js";
import { json, methodNotAllowed, readJsonBody } from "../../lib/http.js";

type ReorderBody = {
  ids?: unknown;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  try {
    await requireAdmin(req);
    const body = readJsonBody<ReorderBody>(req);
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string" || !id.trim())) {
      return json(res, 400, { error: "invalid_order" });
    }

    const products = await reorderProducts(body.ids);
    return json(res, 200, { products });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    if (err instanceof Error && err.message === "invalid_order") {
      return json(res, 400, { error: "invalid_order" });
    }
    console.error("admin_products_reorder_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
