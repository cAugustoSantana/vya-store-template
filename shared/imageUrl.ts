const VERCEL_BLOB_HOST = "vercel-storage.com";

/** True when the blob URL is private and must be proxied through our API. */
export function shouldProxyBlobUrl(url: string): boolean {
  if (!url || url.startsWith("/")) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes(VERCEL_BLOB_HOST) &&
      !parsed.hostname.includes(".public.")
    );
  } catch {
    return false;
  }
}

export function resolvePublicLogoUrl(logoUrl: string): string {
  if (!logoUrl) return "/logo.svg";
  if (shouldProxyBlobUrl(logoUrl)) return "/api/settings/logo";
  return logoUrl;
}

export function resolvePublicProductImageUrl(productId: string, imageUrl: string): string {
  if (!imageUrl) return "/products/prod-1.svg";
  if (shouldProxyBlobUrl(imageUrl)) return `/api/products/${productId}/image`;
  return imageUrl;
}
