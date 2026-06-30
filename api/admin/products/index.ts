import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db.js";
import { requireAdmin } from "../../lib/auth.js";
import { createProduct, listAllProducts } from "../../lib/products.js";
import { normalizeProductTextInput } from "../../../shared/productText.js";
import { sanitizePersistedImageUrl } from "../../../shared/imageUrl.js";
import { normalizeVariantsInput } from "../../../shared/productVariants.js";
import { json, methodNotAllowed, readJsonBody } from "../../lib/http.js";

type CreateProductBody = {
  id: string;
  name: string | Record<string, string>;
  description: string | Record<string, string>;
  price: number;
  imageUrl?: string;
  variantOptions?: Record<string, unknown>;
  variants?: unknown;
  active?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  try {
    await requireAdmin(req);

    if (req.method === "GET") {
      const products = await listAllProducts();
      return json(res, 200, { products });
    }

    if (req.method === "POST") {
      const body = readJsonBody<CreateProductBody>(req);
      const name = normalizeProductTextInput(body.name);
      const description = normalizeProductTextInput(body.description);
      if (!body.id?.trim() || !name || !description || body.price == null) {
        return json(res, 400, { error: "invalid_request" });
      }
      if (body.price < 0) {
        return json(res, 400, { error: "invalid_price" });
      }
      if (body.stockQuantity != null && (body.stockQuantity < 0 || !Number.isInteger(body.stockQuantity))) {
        return json(res, 400, { error: "invalid_stock" });
      }

      const product = await createProduct({
        id: body.id.trim(),
        name,
        description,
        price: body.price,
        imageUrl: sanitizePersistedImageUrl(body.imageUrl?.trim()),
        variantOptions: body.variantOptions ?? {},
        variants: normalizeVariantsInput(body.variants),
        active: body.active,
        sortOrder: body.sortOrder,
        stockQuantity: body.stockQuantity,
      });
      return json(res, 201, { product });
    }

    return methodNotAllowed(res);
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return json(res, 409, { error: "product_exists" });
    }
    console.error("admin_products_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
