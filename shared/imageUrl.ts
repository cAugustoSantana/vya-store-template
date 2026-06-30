export const BLOB_URL_RE = /\.blob\.vercel-storage\.com\//;
export const PRODUCT_IMAGE_PLACEHOLDER = "/products/prod-1.svg";

/** Browser-only preview URLs that must never be stored or served from the server. */
export function isTransientImageUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("blob:") || trimmed.startsWith("data:");
}

/** Normalize image URLs before persisting to the database. */
export function sanitizePersistedImageUrl(
  url: string | null | undefined,
  fallback = PRODUCT_IMAGE_PLACEHOLDER,
): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed || isTransientImageUrl(trimmed)) return fallback;
  return trimmed;
}

/** True when the blob URL is private and must be proxied through our API. */
export function shouldProxyBlobUrl(url: string, blobAccess?: string): boolean {
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed.startsWith("/") ||
    isTransientImageUrl(trimmed)
  ) {
    return false;
  }
  if (!BLOB_URL_RE.test(trimmed)) {
    return false;
  }
  if (blobAccess === "public") {
    return false;
  }
  return true;
}

export function resolvePublicLogoUrl(logoUrl: string, blobAccess?: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return "/logo.svg";
  if (!shouldProxyBlobUrl(trimmed, blobAccess)) {
    return trimmed;
  }
  return "/api/settings/logo";
}

/** True when the store has uploaded or configured a logo other than the default placeholder. */
export function hasCustomLogo(logoUrl: string): boolean {
  const trimmed = logoUrl.trim();
  return Boolean(trimmed && trimmed !== "/logo.svg");
}

export function resolvePublicProductImageUrl(
  productId: string,
  imageUrl: string,
  blobAccess?: string,
): string {
  const trimmed = imageUrl.trim();
  if (!trimmed || isTransientImageUrl(trimmed)) return PRODUCT_IMAGE_PLACEHOLDER;
  if (!shouldProxyBlobUrl(trimmed, blobAccess)) {
    return trimmed;
  }
  return `/api/products/${encodeURIComponent(productId)}/image`;
}
