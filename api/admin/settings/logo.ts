import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasDatabase } from "../../lib/db.js";
import { requireAdmin } from "../../lib/auth.js";
import { uploadStoreLogo } from "../../lib/blob.js";
import {
  getStoreConfig,
  getStoreSettingsUpdatedAt,
  saveStoreSettings,
} from "../../lib/storeSettings.js";
import { validateProofImage } from "../../lib/validate.js";
import { json, methodNotAllowed, readJsonBody } from "../../lib/http.js";

type LogoBody = {
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

  try {
    await requireAdmin(req);

    const body = readJsonBody<LogoBody>(req);
    if (!body.imageBase64) {
      return json(res, 400, { error: "missing_image" });
    }

    const raw = body.imageBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(raw, "base64");
    const contentType = validateProofImage(buffer, body.mimeType);
    const logoUrl = await uploadStoreLogo({ buffer, contentType });

    const current = await getStoreConfig();
    const settings = await saveStoreSettings({ ...current, logoUrl });
    const updatedAt = await getStoreSettingsUpdatedAt();

    return json(res, 200, { settings, logoUrl, updatedAt });
  } catch (err) {
    if (err instanceof Error && err.message === "unauthorized") {
      return json(res, 401, { error: "unauthorized" });
    }
    if (err instanceof Error) {
      const clientErrors = new Set([
        "file_too_large",
        "invalid_image_type",
        "invalid_image_magic",
        "invalid_logo_url",
      ]);
      if (clientErrors.has(err.message)) {
        return json(res, 400, { error: err.message });
      }
      if (err.message === "BLOB_READ_WRITE_TOKEN is not configured") {
        return json(res, 503, { error: "blob_not_configured" });
      }
    }
    console.error("admin_settings_logo_error", err);
    return json(res, 500, { error: "server_error" });
  }
}
