import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    node: process.version,
    hasDatabase: Boolean(process.env.DATABASE_URL),
    hasAdminSecret: Boolean(process.env.ADMIN_SECRET),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasBlob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobAccess: process.env.BLOB_ACCESS === "public" ? "public" : "private",
  });
}
