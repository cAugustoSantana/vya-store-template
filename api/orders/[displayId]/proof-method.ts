import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db";
import { getOrderByDisplayId, updateProofMethod } from "../../lib/orders";
import { json, methodNotAllowed, readJsonBody } from "../../lib/http";

type ProofMethodBody = { method: "whatsapp" };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!hasDatabase()) {
    return json(res, 503, { error: "database_not_configured" });
  }

  const displayId = req.query.displayId;
  if (typeof displayId !== "string" || !displayId.trim()) {
    return json(res, 400, { error: "missing_display_id" });
  }

  const existing = await getOrderByDisplayId(displayId);
  if (!existing) {
    return json(res, 404, { error: "order_not_found" });
  }

  try {
    const body = readJsonBody<ProofMethodBody>(req);
    if (body.method !== "whatsapp") {
      return json(res, 400, { error: "invalid_method" });
    }

    await updateProofMethod(displayId, "whatsapp");
    return json(res, 200, {
      displayId,
      paymentProofMethod: "whatsapp",
    });
  } catch (err) {
    console.error("proof_method_error", err);
    return json(res, 400, { error: "invalid_request" });
  }
}
