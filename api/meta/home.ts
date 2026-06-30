import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSocialMetaDocument } from "../../shared/socialMeta.js";
import { getHomeSocialMeta, getRequestOrigin } from "../lib/socialMeta.js";
import { methodNotAllowed } from "../lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  try {
    const origin = getRequestOrigin(req);
    const meta = await getHomeSocialMeta(origin);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(buildSocialMetaDocument(meta));
  } catch (err) {
    console.error("meta_home_error", err);
    res.status(500).send("error");
  }
}
