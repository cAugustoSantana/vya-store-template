import { describe, expect, it } from "vitest";
import {
  defaultStoreSettings,
  mergeStoreSettings,
  resolvePublicLogoUrl,
  toPublicStoreSettings,
  validateStoreSettings,
} from "./storeSettings.js";

describe("storeSettings", () => {
  it("returns defaults when stored config is empty", () => {
    const merged = mergeStoreSettings(null);
    expect(merged.storeSlug).toBe("MITIENDA");
    expect(merged.taxRate).toBe(0.18);
  });

  it("merges partial stored overrides", () => {
    const merged = mergeStoreSettings({
      storeName: { es: "Tienda Demo", en: "Demo Store" },
      taxRate: 0.1,
    });
    expect(merged.storeName.en).toBe("Demo Store");
    expect(merged.taxRate).toBe(0.1);
    expect(merged.currency).toBe("DOP");
  });

  it("validates and rejects invalid tax rate", () => {
    expect(() => validateStoreSettings({ taxRate: 2 })).not.toThrow();
    const merged = validateStoreSettings({ taxRate: 2 });
    expect(merged.taxRate).toBe(0.18);
  });

  it("strips private fields from public settings", () => {
    const config = defaultStoreSettings();
    const pub = toPublicStoreSettings(config);
    expect(pub).not.toHaveProperty("email");
    expect(pub.contact).not.toHaveProperty("ownerEmail");
  });

  it("maps private blob logos to the public logo route", () => {
    const original = process.env.BLOB_ACCESS;
    process.env.BLOB_ACCESS = "private";
    expect(
      resolvePublicLogoUrl("https://abc.private.blob.vercel-storage.com/store/logo.png"),
    ).toBe("/api/settings/logo");
    process.env.BLOB_ACCESS = "public";
    expect(
      resolvePublicLogoUrl("https://abc.public.blob.vercel-storage.com/store/logo.png"),
    ).toBe("https://abc.public.blob.vercel-storage.com/store/logo.png");
    process.env.BLOB_ACCESS = original;
  });
});
