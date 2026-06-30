import { describe, it, expect } from "vitest";
import {
  hasCustomLogo,
  resolvePublicLogoUrl,
  resolvePublicProductImageUrl,
  shouldProxyBlobUrl,
} from "./imageUrl.js";

const privateBlob =
  "https://u0gs7aghrfzktk7f.private.blob.vercel-storage.com/products/Cuero001/1782043875163.jpg";

describe("imageUrl", () => {
  it("proxies private blob URLs", () => {
    expect(shouldProxyBlobUrl(privateBlob)).toBe(true);
    expect(resolvePublicProductImageUrl("Cuero001", privateBlob)).toBe(
      "/api/products/Cuero001/image",
    );
    expect(resolvePublicLogoUrl(privateBlob)).toBe("/api/settings/logo");
  });

  it("keeps local and public paths unchanged", () => {
    expect(resolvePublicProductImageUrl("prod-1", "/products/prod-1.svg")).toBe(
      "/products/prod-1.svg",
    );
    expect(shouldProxyBlobUrl("/products/prod-1.svg")).toBe(false);
  });

  it("skips proxy when blob store is public", () => {
    expect(shouldProxyBlobUrl(privateBlob, "public")).toBe(false);
    expect(resolvePublicProductImageUrl("Cuero001", privateBlob, "public")).toBe(privateBlob);
  });

  it("detects custom logo", () => {
    expect(hasCustomLogo("/logo.svg")).toBe(false);
    expect(hasCustomLogo("")).toBe(false);
    expect(hasCustomLogo("https://example.com/logo.png")).toBe(true);
  });

  it("rejects transient preview URLs for public display and persistence", async () => {
    const { isTransientImageUrl, sanitizePersistedImageUrl } = await import("./imageUrl.js");
    const blobPreview = "blob:https://stm.vya.do/abc-123";
    expect(isTransientImageUrl(blobPreview)).toBe(true);
    expect(sanitizePersistedImageUrl(blobPreview)).toBe("/products/prod-1.svg");
    expect(resolvePublicProductImageUrl("STM-001", blobPreview)).toBe("/products/prod-1.svg");
  });
});
