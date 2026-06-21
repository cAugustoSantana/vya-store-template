import { describe, expect, it } from "vitest";
import {
  resolvePublicLogoUrl,
  resolvePublicProductImageUrl,
  shouldProxyBlobUrl,
} from "./imageUrl";

describe("shouldProxyBlobUrl", () => {
  it("returns false for local paths", () => {
    expect(shouldProxyBlobUrl("/logo.svg")).toBe(false);
  });

  it("returns false for public blob URLs", () => {
    expect(
      shouldProxyBlobUrl("https://abc.public.blob.vercel-storage.com/logo.png"),
    ).toBe(false);
  });

  it("returns true for private blob URLs", () => {
    expect(shouldProxyBlobUrl("https://abc.blob.vercel-storage.com/logo.png")).toBe(true);
  });
});

describe("resolvePublicLogoUrl", () => {
  it("proxies private blobs", () => {
    expect(resolvePublicLogoUrl("https://abc.blob.vercel-storage.com/logo.png")).toBe(
      "/api/settings/logo",
    );
  });

  it("passes through public URLs", () => {
    expect(resolvePublicLogoUrl("https://example.com/logo.png")).toBe(
      "https://example.com/logo.png",
    );
  });
});

describe("resolvePublicProductImageUrl", () => {
  it("proxies private product images", () => {
    expect(
      resolvePublicProductImageUrl("prod-1", "https://abc.blob.vercel-storage.com/p.png"),
    ).toBe("/api/products/prod-1/image");
  });
});
