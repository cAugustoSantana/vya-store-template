import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db.js";
import { getClientIp, json, methodNotAllowed, readJsonBody } from "../../lib/http.js";
import { rateLimit, rateLimitKey } from "../../lib/rateLimit.js";
import { validateProofImage } from "../../lib/validate.js";
import { getOrderByDisplayId, updateProofMethod } from "../../lib/orders.js";
import { uploadProofImage } from "../../lib/blob.js";
import { sendProofUploadedEmail } from "../../lib/email.js";

type ProofUploadBody = {
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

  const displayId = req.query.displayId;
  if (typeof displayId !== "string" || !displayId.trim()) {
    return json(res, 400, { error: "missing_display_id" });
  }

  const ip = getClientIp(req);
  const limit = await rateLimit(rateLimitKey("proof", ip, displayId), "proof");
  if (!limit.allowed) {
    return json(res, 429, { error: "rate_limit", retryAfterSec: limit.retryAfterSec });
  }

  const existing = await getOrderByDisplayId(displayId);
  if (!existing) {
    return json(res, 404, { error: "order_not_found" });
  }

  try {
    const body = readJsonBody<ProofUploadBody>(req);
    if (!body.imageBase64) {
      return json(res, 400, { error: "missing_image" });
    }

    const raw = body.imageBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(raw, "base64");
    const contentType = validateProofImage(buffer, body.mimeType);
    const proofUrl = await uploadProofImage({ displayId, buffer, contentType });
    const order = await updateProofMethod(displayId, "upload", proofUrl);

    if (order) {
      await sendProofUploadedEmail(order);
    }

    return json(res, 200, {
      displayId,
      paymentProofMethod: "upload",
      hasProof: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upload_failed";
    if (message === "invalid_json") {
      return json(res, 400, { error: "invalid_json" });
    }
    if (
      message === "file_too_large" ||
      message === "invalid_image_type" ||
      message === "invalid_image_magic"
    ) {
      return json(res, 400, { error: message });
    }
    if (message === "BLOB_READ_WRITE_TOKEN is not configured") {
      return json(res, 503, { error: "blob_not_configured" });
    }
    console.error("proof_upload_error", err);
    const blobMessage = err instanceof Error ? err.name : "";
    if (blobMessage.startsWith("Blob")) {
      return json(res, 502, { error: "blob_upload_failed" });
    }
    return json(res, 500, { error: "upload_failed" });
  }
}
