import { resolvePublicLogoUrl } from "@/lib/logoUrl";

export const FAVICON_API_PATH = "/api/settings/logo";

export function syncFavicon(logoUrl: string): void {
  const href = resolvePublicLogoUrl(logoUrl);
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
  link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
}
