import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildHomeSocialMeta, socialMetaToHtml } from "../../shared/socialMeta.js";
import { getStoreConfig } from "../lib/storeSettings.js";
import { getSiteOrigin } from "../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = await getStoreConfig();
  const origin = getSiteOrigin(req);
  const locale = config.defaultLocale;
  const meta = buildHomeSocialMeta({
    origin,
    storeName: config.storeName,
    description: config.description,
    locale,
    defaultLocale: config.defaultLocale,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return res.status(200).send(socialMetaToHtml(meta));
}
