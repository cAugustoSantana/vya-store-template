import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db.js";
import { requireAdmin } from "../../lib/auth.js";
import { getOrderById } from "../../lib/orders.js";
import { fetchProofImage } from "../../lib/blob.js";
import { json, methodNotAllowed } from "../../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  const orderId = req.query.orderId;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return json(res, 400, { error: "missing_order_id" });
  }

  try {
    await requireAdmin(req);
    const order = await getOrderById(orderId);
    if (!order?.payment_proof_url) {
      return json(res, 404, { error: "proof_not_found" });
    }

    const { buffer, contentType } = await fetchProofImage(order.payment_proof_url);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).send(buffer);
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    if (err instanceof Error && err.message === "proof_not_found") {
      return json(res, 404, { error: "proof_not_found" });
    }
    if (err instanceof Error && err.message === "BLOB_READ_WRITE_TOKEN is not configured") {
      return json(res, 503, { error: "blob_not_configured" });
    }
    console.error("admin_proof_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
