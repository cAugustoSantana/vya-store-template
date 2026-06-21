import type { Locale } from "./types";
import { resolveLocalized } from "./localized";

export type SocialMetaTags = {
  title: string;
  description: string;
  image: string;
  url: string;
  type: "website" | "product";
};

export function buildHomeSocialMeta(params: {
  origin: string;
  storeName: Record<Locale, string>;
  description: Record<Locale, string>;
  locale: Locale;
  defaultLocale: Locale;
}): SocialMetaTags {
  const title = resolveLocalized(params.storeName, params.locale, params.defaultLocale);
  const description = resolveLocalized(params.description, params.locale, params.defaultLocale);
  return {
    title,
    description,
    image: `${params.origin}/api/settings/logo`,
    url: params.origin,
    type: "website",
  };
}

export function buildProductSocialMeta(params: {
  origin: string;
  productId: string;
  productName: Record<Locale, string>;
  productDescription: Record<Locale, string>;
  imageUrl: string;
  locale: Locale;
  defaultLocale: Locale;
}): SocialMetaTags {
  const title = resolveLocalized(params.productName, params.locale, params.defaultLocale);
  const description = resolveLocalized(
    params.productDescription,
    params.locale,
    params.defaultLocale,
  );
  const image = params.imageUrl.startsWith("http")
    ? params.imageUrl
    : `${params.origin}${params.imageUrl.startsWith("/") ? "" : "/"}${params.imageUrl}`;

  return {
    title,
    description,
    image: image.includes("vercel-storage.com") && !image.includes(".public.")
      ? `${params.origin}/api/products/${params.productId}/image`
      : image,
    url: `${params.origin}/products/${params.productId}`,
    type: "product",
  };
}

export function socialMetaToHtml(meta: SocialMetaTags): string {
  const tags = [
    ["og:title", meta.title],
    ["og:description", meta.description],
    ["og:image", meta.image],
    ["og:url", meta.url],
    ["og:type", meta.type],
    ["twitter:card", "summary_large_image"],
    ["twitter:title", meta.title],
    ["twitter:description", meta.description],
    ["twitter:image", meta.image],
  ];

  const metaTags = tags
    .map(
      ([property, content]) =>
        `<meta property="${property}" content="${escapeAttr(content)}" />`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeAttr(meta.title)}</title>
  <meta name="description" content="${escapeAttr(meta.description)}" />
  ${metaTags}
</head>
<body><p>${escapeAttr(meta.title)}</p></body>
</html>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
