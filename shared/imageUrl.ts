export const BLOB_URL_RE = /\.blob\.vercel-storage\.com\//;
export const PRODUCT_IMAGE_PLACEHOLDER = "/products/prod-1.svg";
export const MAX_PRODUCT_IMAGES = 8;

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

export function readProductImageUrls(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("invalid_images");
  }
  return value;
}

/** Drop empty and browser-only preview URLs. Caps the list at MAX_PRODUCT_IMAGES. */
export function sanitizeProductImageUrls(urls: readonly string[]): string[] {
  const result: string[] = [];
  for (const url of urls) {
    const sanitized = sanitizePersistedImageUrl(url, "");
    if (!sanitized) continue;
    result.push(sanitized);
    if (result.length >= MAX_PRODUCT_IMAGES) break;
  }
  return result;
}

/**
 * Gallery wins when provided. Otherwise a single imageUrl replaces the cover
 * and stays first in the existing gallery.
 */
export function normalizeProductImages(input: {
  imageUrls?: readonly string[];
  imageUrl?: string;
  existing?: { imageUrl: string; imageUrls: readonly string[] };
}): { imageUrl: string; imageUrls: string[] } {
  if (input.imageUrls !== undefined) {
    if (input.imageUrls.length > MAX_PRODUCT_IMAGES) {
      throw new Error("too_many_images");
    }
    const imageUrls = sanitizeProductImageUrls(input.imageUrls);
    return {
      imageUrls,
      imageUrl: imageUrls[0] ?? PRODUCT_IMAGE_PLACEHOLDER,
    };
  }

  if (input.imageUrl !== undefined) {
    const imageUrl = sanitizePersistedImageUrl(
      input.imageUrl,
      input.existing?.imageUrl ?? PRODUCT_IMAGE_PLACEHOLDER,
    );
    const previous = sanitizeProductImageUrls(input.existing?.imageUrls ?? []);
    if (previous.length === 0) {
      return { imageUrl, imageUrls: [imageUrl] };
    }
    return { imageUrl, imageUrls: [imageUrl, ...previous.slice(1)] };
  }

  if (input.existing) {
    const imageUrls = sanitizeProductImageUrls(input.existing.imageUrls);
    return {
      imageUrl: input.existing.imageUrl,
      imageUrls: imageUrls.length > 0 ? imageUrls : [input.existing.imageUrl],
    };
  }

  return {
    imageUrl: PRODUCT_IMAGE_PLACEHOLDER,
    imageUrls: [PRODUCT_IMAGE_PLACEHOLDER],
  };
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
  index = 0,
): string {
  const trimmed = imageUrl.trim();
  if (!trimmed || isTransientImageUrl(trimmed)) return PRODUCT_IMAGE_PLACEHOLDER;
  if (!shouldProxyBlobUrl(trimmed, blobAccess)) {
    return trimmed;
  }
  const path = `/api/products/${encodeURIComponent(productId)}/image`;
  if (!Number.isInteger(index) || index <= 0) return path;
  return `${path}?i=${index}`;
}
