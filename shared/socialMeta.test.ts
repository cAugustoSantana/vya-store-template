import { describe, expect, it } from "vitest";
import { buildHomeSocialMeta, buildProductSocialMeta, socialMetaToHtml } from "./socialMeta";

describe("buildHomeSocialMeta", () => {
  it("builds home tags with logo image", () => {
    const meta = buildHomeSocialMeta({
      origin: "https://example.com",
      storeName: { es: "Mi Tienda", en: "My Store" },
      description: { es: "Desc", en: "Desc EN" },
      locale: "es",
      defaultLocale: "es",
    });
    expect(meta.title).toBe("Mi Tienda");
    expect(meta.image).toBe("https://example.com/api/settings/logo");
    expect(meta.url).toBe("https://example.com");
  });
});

describe("buildProductSocialMeta", () => {
  it("proxies private blob images", () => {
    const meta = buildProductSocialMeta({
      origin: "https://example.com",
      productId: "prod-1",
      productName: { es: "Camiseta", en: "Shirt" },
      productDescription: { es: "Algodón", en: "Cotton" },
      imageUrl: "https://abc.blob.vercel-storage.com/p.png",
      locale: "es",
      defaultLocale: "es",
    });
    expect(meta.image).toBe("https://example.com/api/products/prod-1/image");
    expect(meta.url).toContain("/products/prod-1");
  });
});

describe("socialMetaToHtml", () => {
  it("renders og tags", () => {
    const html = socialMetaToHtml({
      title: "Test",
      description: "Desc",
      image: "https://example.com/logo.png",
      url: "https://example.com",
      type: "website",
    });
    expect(html).toContain('property="og:title"');
    expect(html).toContain("Test");
  });
});
