import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db";
import { requireAdmin } from "../../lib/auth";
import { getOrderById } from "../../lib/orders";
import { json, methodNotAllowed } from "../../lib/http";

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

    return json(res, 200, { url: order.payment_proof_url });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    console.error("admin_proof_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
