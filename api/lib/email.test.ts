import { describe, expect, it, vi, beforeEach } from "vitest";
import { getSiteOriginForEmail } from "./email.js";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: "test" }) },
  })),
}));

vi.mock("./storeSettings.js", () => ({
  getStoreConfig: vi.fn().mockResolvedValue({
    storeSlug: "MITIENDA",
    storeName: { es: "Mi Tienda", en: "My Store" },
    description: { es: "Desc", en: "Desc" },
    defaultLocale: "es",
    supportedLocales: ["es", "en"],
    currency: "DOP",
    taxRate: 0.18,
    primaryColor: "#2563eb",
    logoUrl: "/logo.svg",
    phone: { defaultCountryCode: "1", localDigits: 10 },
    email: { from: "test@example.com" },
    contact: {
      whatsappCountryCode: "1",
      whatsappNumber: "8095551234",
      instagramUrl: "",
      ownerEmail: "owner@example.com",
    },
    payment: {
      provider: "bank_transfer_proof",
      bankTransfer: {
        instructions: { es: "Banco: Bank\nCuenta: 123", en: "Bank: Bank\nAccount: 123" },
      },
    },
    orderStatuses: ["payment_confirmation_pending", "confirmed", "out_for_delivery", "delivered", "cancelled"],
    defaultOrderStatus: "payment_confirmation_pending",
  }),
  localizedField: (field: Record<string, string>, locale: string) => field[locale] ?? field.es,
}));

describe("getSiteOriginForEmail", () => {
  beforeEach(() => {
    delete process.env.SITE_URL;
    delete process.env.VERCEL_URL;
  });

  it("prefers SITE_URL", () => {
    process.env.SITE_URL = "https://shop.example.com/";
    expect(getSiteOriginForEmail()).toBe("https://shop.example.com");
  });

  it("falls back to VERCEL_URL", () => {
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getSiteOriginForEmail()).toBe("https://my-app.vercel.app");
  });
});
