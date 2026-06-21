import { get, put } from "@vercel/blob";

function getBlobAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  return token;
}

export async function uploadProofImage(params: {
  displayId: string;
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `proofs/${params.displayId}-${Date.now()}.${ext}`;

  const blob = await put(pathname, params.buffer, {
    access: getBlobAccess(),
    addRandomSuffix: true,
    contentType: params.contentType,
    token: getBlobToken(),
  });

  return blob.url;
}

export async function uploadProductImage(params: {
  productId: string;
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `products/${params.productId}/${Date.now()}.${ext}`;

  const blob = await put(pathname, params.buffer, {
    access: getBlobAccess(),
    addRandomSuffix: true,
    contentType: params.contentType,
    token: getBlobToken(),
  });

  return blob.url;
}

export async function uploadStoreLogo(params: {
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `store/logo/${Date.now()}.${ext}`;

  const blob = await put(pathname, params.buffer, {
    access: getBlobAccess(),
    addRandomSuffix: true,
    contentType: params.contentType,
    token: getBlobToken(),
  });

  return blob.url;
}

export async function fetchBlobImage(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const result = await get(url, {
    access: getBlobAccess(),
    token: getBlobToken(),
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("blob_not_found");
  }

  const chunks: Uint8Array[] = [];
  const reader = result.stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return {
    buffer: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    contentType: result.blob.contentType,
  };
}

/** @deprecated Use fetchBlobImage */
export async function fetchProofImage(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  return fetchBlobImage(url);
}
