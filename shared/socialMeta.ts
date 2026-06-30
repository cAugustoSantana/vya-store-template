export type SocialMeta = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "product";
  siteName?: string;
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return origin;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${origin.replace(/\/$/, "")}${trimmed}`;
  return trimmed;
}

export function buildSocialMetaTags(meta: SocialMeta): string[] {
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta property="og:type" content="${meta.type ?? "website"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];

  if (meta.siteName) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`);
  }

  if (meta.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}" />`);
    tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`);
  } else {
    tags.push(`<meta name="twitter:card" content="summary" />`);
  }

  return tags;
}

export function buildSocialMetaDocument(meta: SocialMeta): string {
  const tags = buildSocialMetaTags(meta).join("\n    ");
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    ${tags}
  </head>
  <body>
    <p><a href="${escapeHtml(meta.url)}">${escapeHtml(meta.title)}</a></p>
  </body>
</html>`;
}

export const SOCIAL_BOT_UA =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|telegrambot|pinterest/i;
