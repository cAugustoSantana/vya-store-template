import { get, put, type PutBlobResult } from "@vercel/blob";
import { requireEnv } from "./env.js";

type BlobAccess = "public" | "private";

let resolvedBlobAccess: BlobAccess | null = null;

function getConfiguredBlobAccess(): BlobAccess {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

export function getBlobAccess(): BlobAccess {
  return resolvedBlobAccess ?? getConfiguredBlobAccess();
}

export function isBlobAccessMismatchError(err: unknown): boolean {
  return (
    err instanceof Error &&
    /Cannot use (?:private|public) access on a (?:public|private) store/.test(
      err.message,
    )
  );
}

function alternateBlobAccess(access: BlobAccess): BlobAccess {
  return access === "public" ? "private" : "public";
}

async function putBlob(
  pathname: string,
  body: Buffer,
  options: {
    addRandomSuffix: boolean;
    contentType: "image/png" | "image/jpeg";
  },
): Promise<PutBlobResult> {
  const token = getBlobToken();
  const access = getBlobAccess();

  try {
    return await put(pathname, body, { ...options, access, token });
  } catch (err) {
    if (!isBlobAccessMismatchError(err)) throw err;
    const fallback = alternateBlobAccess(access);
    resolvedBlobAccess = fallback;
    return put(pathname, body, { ...options, access: fallback, token });
  }
}

async function getBlob(url: string) {
  const token = getBlobToken();
  const access = getBlobAccess();

  try {
    return await get(url, { access, token });
  } catch (err) {
    if (!isBlobAccessMismatchError(err)) throw err;
    const fallback = alternateBlobAccess(access);
    resolvedBlobAccess = fallback;
    return get(url, { access: fallback, token });
  }
}

function getBlobToken(): string {
  return requireEnv("BLOB_READ_WRITE_TOKEN", "READ_WRITE_TOKEN");
}

export async function uploadProofImage(params: {
  displayId: string;
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `proofs/${params.displayId}-${Date.now()}.${ext}`;

  const blob = await putBlob(pathname, params.buffer, {
    addRandomSuffix: true,
    contentType: params.contentType,
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

  const blob = await putBlob(pathname, params.buffer, {
    addRandomSuffix: true,
    contentType: params.contentType,
  });

  return blob.url;
}

export async function uploadStoreLogo(params: {
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
}): Promise<string> {
  const ext = params.contentType === "image/png" ? "png" : "jpg";
  const pathname = `store/logo/${Date.now()}.${ext}`;

  const blob = await putBlob(pathname, params.buffer, {
    addRandomSuffix: true,
    contentType: params.contentType,
  });

  return blob.url;
}

export async function fetchBlobImage(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const result = await getBlob(url);

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
