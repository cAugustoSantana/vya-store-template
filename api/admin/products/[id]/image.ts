import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../../lib/db.js";
import { requireAdmin } from "../../../lib/auth.js";
import { getProductById } from "../../../lib/products.js";
import { uploadProductImage } from "../../../lib/blob.js";
import { validateProofImage } from "../../../lib/validate.js";
import { json, methodNotAllowed, readJsonBody } from "../../../lib/http.js";

type ImageBody = {
  imageBase64: string;
  mimeType?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
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
    await requireAdmin(req);

    const existing = await getProductById(id);
    if (!existing) {
      return json(res, 404, { error: "product_not_found" });
    }

    const body = readJsonBody<ImageBody>(req);
    if (!body.imageBase64) {
      return json(res, 400, { error: "missing_image" });
    }

    const raw = body.imageBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(raw, "base64");
    const contentType = validateProofImage(buffer, body.mimeType);
    const imageUrl = await uploadProductImage({ productId: id, buffer, contentType });
    return json(res, 200, { imageUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    if (err instanceof Error) {
      const clientErrors = new Set([
        "file_too_large",
        "invalid_image_type",
        "invalid_image_magic",
      ]);
      if (clientErrors.has(err.message)) {
        return json(res, 400, { error: err.message });
      }
    }
    console.error("admin_product_image_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
