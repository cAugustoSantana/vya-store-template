import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../lib/db.js";
import { requireAdmin } from "../lib/auth.js";
import { getOrderById, updateOrderStatus } from "../lib/orders.js";
import { notifyOrderStatusChange } from "../lib/email.js";
import { isValidOrderStatus } from "../lib/validate.js";
import type { OrderStatus } from "../../shared/types.js";
import { json, methodNotAllowed, readJsonBody } from "../lib/http.js";

type StatusBody = { orderId: string; estado: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  try {
    await requireAdmin(req);
    const body = readJsonBody<StatusBody>(req);

    if (!body.orderId || !body.estado) {
      return json(res, 400, { error: "invalid_request" });
    }
    if (!isValidOrderStatus(body.estado)) {
      return json(res, 400, { error: "invalid_status" });
    }

    const existing = await getOrderById(body.orderId);
    if (!existing) {
      return json(res, 404, { error: "order_not_found" });
    }

    const previousStatus = existing.estado as OrderStatus;
    const updated = await updateOrderStatus(body.orderId, body.estado);
    if (!updated) {
      return json(res, 404, { error: "order_not_found" });
    }

    if (previousStatus !== updated.estado) {
      await notifyOrderStatusChange({
        orderId: body.orderId,
        previousStatus,
        newStatus: updated.estado as OrderStatus,
      });
    }

    return json(res, 200, {
      id: updated.id,
      displayId: updated.display_id,
      estado: updated.estado,
      paymentVerifiedAt: updated.payment_verified_at,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    console.error("admin_status_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
