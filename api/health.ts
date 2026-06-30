import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getBlobAccess } from "./lib/blob.js";
import { resolveEnv } from "./lib/env.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    node: process.version,
    hasDatabase: Boolean(resolveEnv("DATABASE_URL", "POSTGRES_URL")),
    hasAdminSecret: Boolean(process.env.ADMIN_SECRET),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasBlob: Boolean(resolveEnv("BLOB_READ_WRITE_TOKEN", "READ_WRITE_TOKEN")),
    blobAccess: getBlobAccess(),
  });
}
