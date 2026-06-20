import { put } from "@vercel/blob";

function getBlobAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

export async function uploadProofImage(params: {
  displayId: string;
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `proofs/${params.displayId}-${Date.now()}.${ext}`;

  const blob = await put(pathname, params.buffer, {
    access: getBlobAccess(),
    addRandomSuffix: true,
    contentType: params.contentType,
    token,
  });

  return blob.url;
}
