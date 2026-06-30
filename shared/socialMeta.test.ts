import { describe, expect, it } from "vitest";
import { buildSocialMetaDocument, escapeHtml, toAbsoluteUrl } from "./socialMeta";

describe("socialMeta", () => {
  it("escapes HTML in meta output", () => {
    expect(escapeHtml(`Tom & Jerry "shop"`)).toBe("Tom &amp; Jerry &quot;shop&quot;");
  });

  it("builds absolute URLs from paths", () => {
    expect(toAbsoluteUrl("https://example.com", "/api/products/1/image")).toBe(
      "https://example.com/api/products/1/image",
    );
  });

  it("includes og tags in bot document", () => {
    const html = buildSocialMetaDocument({
      title: "Abanico Portada",
      description: "Abanico Portada",
      url: "https://example.com/products/Cuero001",
      image: "https://example.com/api/products/Cuero001/image",
      type: "product",
      siteName: "Cuero",
    });

    expect(html).toContain('property="og:title" content="Abanico Portada"');
    expect(html).toContain('property="og:image" content="https://example.com/api/products/Cuero001/image"');
    expect(html).toContain('property="og:type" content="product"');
  });
});
