import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db";
import { getOrderByDisplayId } from "../../lib/orders";
import { getPaymentInstructions } from "../../lib/payments";
import { json, methodNotAllowed } from "../../lib/http";
import type { Locale } from "../../../shared/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  const displayId = req.query.displayId;
  if (typeof displayId !== "string" || !displayId.trim()) {
    return json(res, 400, { error: "missing_display_id" });
  }

  const order = await getOrderByDisplayId(displayId);
  if (!order) {
    return json(res, 404, { error: "order_not_found" });
  }

  const locale = order.locale as Locale;
  const payment = getPaymentInstructions(locale);

  return json(res, 200, {
    displayId: order.display_id,
    total: Number(order.total),
    locale: order.locale,
    estado: order.estado,
    buyerName: order.buyer_name,
    paymentProofMethod: order.payment_proof_method,
    hasProof: Boolean(order.payment_proof_url),
    items: order.items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      variants: item.variants,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.unit_price) * item.quantity,
    })),
    payment,
  });
}
