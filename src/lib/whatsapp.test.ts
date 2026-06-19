import { describe, it, expect } from "vitest";
import {
  buildBuyerWhatsAppUrl,
  buildPaymentProofWhatsAppMessage,
  buildStoreWhatsAppUrl,
} from "./whatsapp";

describe("whatsapp helpers", () => {
  it("builds store wa.me link with encoded text", () => {
    const url = buildStoreWhatsAppUrl("Hola");
    expect(url).toMatch(/^https:\/\/wa\.me\/18095551234\?text=/);
    expect(decodeURIComponent(url.split("text=")[1]!)).toBe("Hola");
  });

  it("builds buyer link from digits", () => {
    expect(buildBuyerWhatsAppUrl("18496202020")).toBe(
      "https://wa.me/18496202020",
    );
  });

  it("builds localized payment proof message", () => {
    const msg = buildPaymentProofWhatsAppMessage({
      displayId: "MITIENDA-a7164",
      buyerName: "Juan",
      totalFormatted: "RD$1,500",
      locale: "es",
    });
    expect(msg).toContain("MITIENDA-a7164");
    expect(msg).toContain("Juan");
  });
});
