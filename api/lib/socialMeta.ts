import { getLocalized } from "../../shared/localized.js";
import {
  resolvePublicLogoUrl,
  resolvePublicProductImageUrl,
} from "../../shared/imageUrl.js";
import { toAbsoluteUrl, type SocialMeta } from "../../shared/socialMeta.js";
import { getStoreConfig, toPublicStoreSettings } from "./storeSettings.js";
import { getProductById } from "./products.js";

function blobAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

export function getRequestOrigin(req: { headers: Record<string, string | string[] | undefined> }): string {
  const protoHeader = req.headers["x-forwarded-proto"];
  const hostHeader = req.headers["x-forwarded-host"] ?? req.headers.host;
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ?? "https";
  const host = (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader) ?? "localhost";
  return `${proto}://${host}`;
}

export async function getHomeSocialMeta(origin: string): Promise<SocialMeta> {
  const config = await getStoreConfig();
  const settings = toPublicStoreSettings(config);
  const locale = settings.defaultLocale;
  const logoPath = resolvePublicLogoUrl(settings.logoUrl, blobAccess());

  return {
    title: getLocalized(settings.storeName, locale),
    description: getLocalized(settings.description, locale),
    url: `${origin.replace(/\/$/, "")}/`,
    image: settings.logoUrl.trim()
      ? toAbsoluteUrl(origin, logoPath)
      : undefined,
    type: "website",
    siteName: getLocalized(settings.storeName, locale),
  };
}

export async function getProductSocialMeta(
  origin: string,
  productId: string,
): Promise<SocialMeta | null> {
  const product = await getProductById(productId);
  if (!product || product.active === false) {
    return null;
  }

  const config = await getStoreConfig();
  const settings = toPublicStoreSettings(config);
  const locale = settings.defaultLocale;
  const imagePath = resolvePublicProductImageUrl(product.id, product.imageUrl, blobAccess());
  const canonicalUrl = `${origin.replace(/\/$/, "")}/products/${encodeURIComponent(product.id)}`;

  return {
    title: product.name,
    description: product.name,
    url: canonicalUrl,
    image: product.imageUrl.trim() ? toAbsoluteUrl(origin, imagePath) : undefined,
    type: "product",
    siteName: getLocalized(settings.storeName, locale),
  };
}
