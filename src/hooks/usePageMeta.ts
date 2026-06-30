import { useEffect } from "react";
import type { SocialMeta } from "@shared/socialMeta";

function upsertMetaTag(
  selector: string,
  create: () => HTMLMetaElement,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertNamedMeta(name: string, content: string): void {
  upsertMetaTag(
    `meta[name="${name}"]`,
    () => {
      const meta = document.createElement("meta");
      meta.name = name;
      return meta;
    },
    content,
  );
}

function upsertPropertyMeta(property: string, content: string): void {
  upsertMetaTag(
    `meta[property="${property}"]`,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      return meta;
    },
    content,
  );
}

export function usePageMeta(meta: SocialMeta | null | undefined): void {
  useEffect(() => {
    if (!meta) return;

    document.title = meta.title;
    upsertNamedMeta("description", meta.description);
    upsertPropertyMeta("og:title", meta.title);
    upsertPropertyMeta("og:description", meta.description);
    upsertPropertyMeta("og:url", meta.url);
    upsertPropertyMeta("og:type", meta.type ?? "website");
    upsertNamedMeta("twitter:title", meta.title);
    upsertNamedMeta("twitter:description", meta.description);

    if (meta.siteName) {
      upsertPropertyMeta("og:site_name", meta.siteName);
    }

    if (meta.image) {
      upsertPropertyMeta("og:image", meta.image);
      upsertNamedMeta("twitter:card", "summary_large_image");
      upsertNamedMeta("twitter:image", meta.image);
    } else {
      upsertNamedMeta("twitter:card", "summary");
    }
  }, [meta]);
}

export function buildPageOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}
