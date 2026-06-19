import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../lib/db";
import { requireAdmin } from "../lib/auth";
import { listOrdersWithItems } from "../lib/orders";
import { json, methodNotAllowed } from "../lib/http";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  try {
    await requireAdmin(req);
    const orders = await listOrdersWithItems();

    return json(res, 200, {
      orders: orders.map((order) => ({
        id: order.id,
        displayId: order.display_id,
        createdAt: order.created_at,
        buyer: {
          name: order.buyer_name,
          phone: order.buyer_phone,
          email: order.buyer_email,
        },
        estado: order.estado,
        total: Number(order.total),
        locale: order.locale,
        paymentProofMethod: order.payment_proof_method,
        hasProof: Boolean(order.payment_proof_url),
        proofUrl: order.payment_proof_url,
        items: order.items.map((item) => ({
          productId: item.product_id,
          productName: item.product_name,
          variants: item.variants,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
        })),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    console.error("admin_orders_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
