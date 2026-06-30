import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "./lib/db.js";
import {
  getClientIp,
  getSiteOrigin,
  json,
  methodNotAllowed,
  readJsonBody,
} from "./lib/http.js";
import { rateLimit, rateLimitKey } from "./lib/rateLimit.js";
import { validateCheckout, type CheckoutInput } from "./lib/validate.js";
import { createOrder } from "./lib/orders.js";
import { sendCheckoutEmails } from "./lib/email.js";

function mapValidationError(err: unknown): { status: number; error: string } {
  const message = err instanceof Error ? err.message : "invalid_request";
  const clientErrors = new Set([
    "honeypot",
    "invalid_locale",
    "invalid_name",
    "invalid_email",
    "invalid_phone",
    "invalid_shipping_address",
    "invalid_shipping_city",
    "invalid_shipping_postal_code",
    "empty_cart",
    "cart_too_large",
    "invalid_product",
    "invalid_quantity",
    "missing_variant",
    "invalid_variant",
    "insufficient_stock",
    "invalid_json",
  ]);
  if (clientErrors.has(message)) {
    return { status: 400, error: message };
  }
  return { status: 400, error: "invalid_request" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  const ip = getClientIp(req);
  const limit = await rateLimit(rateLimitKey("checkout", ip), "checkout");
  if (!limit.allowed) {
    return json(res, 429, { error: "rate_limit", retryAfterSec: limit.retryAfterSec });
  }

  try {
    const body = readJsonBody<CheckoutInput>(req);
    const validated = await validateCheckout(body);
    const { order, items } = await createOrder({
      buyer: validated.buyer,
      shipping: validated.shipping,
      locale: validated.locale,
      total: validated.total,
      lines: validated.lines,
    });

    const origin = getSiteOrigin(req);
    const paymentPageUrl = `${origin}/order/payment/${order.display_id}`;

    await sendCheckoutEmails({ order, items, paymentPageUrl });

    return json(res, 200, {
      displayId: order.display_id,
      total: Number(order.total),
      locale: order.locale,
      buyer: {
        name: order.buyer_name,
        phone: order.buyer_phone,
        email: order.buyer_email,
      },
      items: items.map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        variants: item.variants,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.unit_price) * item.quantity,
      })),
      paymentPageUrl,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "invalid_json") {
      return json(res, 400, { error: "invalid_json" });
    }
    const mapped = mapValidationError(err);
    console.error("checkout_error", err);
    return json(res, mapped.status, { error: mapped.error });
  }
}
