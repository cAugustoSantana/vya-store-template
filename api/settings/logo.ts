import type { VercelRequest, VercelResponse } from "@vercel/node";
import { shouldProxyBlobUrl } from "../../shared/imageUrl.js";
import { fetchBlobImage } from "../lib/blob.js";
import { getStoreConfig } from "../lib/storeSettings.js";
import { methodNotAllowed } from "../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  try {
    const config = await getStoreConfig();
    const logoUrl = config.logoUrl;

    if (!shouldProxyBlobUrl(logoUrl)) {
      if (logoUrl.startsWith("/")) {
        return res.redirect(302, logoUrl);
      }
      return res.redirect(302, logoUrl);
    }

    const { buffer, contentType } = await fetchBlobImage(logoUrl);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("settings_logo_error", err);
    return res.redirect(302, "/logo.svg");
  }
}
