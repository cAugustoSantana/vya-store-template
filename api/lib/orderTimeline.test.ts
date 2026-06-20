import { describe, expect, it } from "vitest";
import { buildOrderTimeline } from "./orderTimeline.js";
import type { OrderWithItems } from "../../shared/db.types.js";

function makeOrder(overrides: Partial<OrderWithItems> = {}): OrderWithItems {
  return {
    id: "ord-1",
    display_id: "MITIENDA-abc123",
    buyer_name: "Buyer",
    buyer_phone: "+18095551234",
    buyer_email: "buyer@example.com",
    locale: "es",
    estado: "payment_confirmation_pending",
    total: "100",
    payment_provider: "bank_transfer_proof",
    payment_proof_method: null,
    payment_proof_url: null,
    payment_verified_at: null,
    shipping_address: "123 Street",
    shipping_city: "Santo Domingo",
    shipping_postal_code: "10101",
    created_at: "2026-06-01T12:00:00.000Z",
    items: [],
    ...overrides,
  };
}

describe("buildOrderTimeline", () => {
  it("includes order placed", () => {
    const events = buildOrderTimeline(makeOrder());
    expect(events[0]).toEqual({
      type: "order_placed",
      at: "2026-06-01T12:00:00.000Z",
    });
  });

  it("includes proof uploaded when upload method and url present", () => {
    const events = buildOrderTimeline(
      makeOrder({
        payment_proof_method: "upload",
        payment_proof_url: "https://blob.example/proof.png",
      }),
    );
    expect(events.some((e) => e.type === "proof_uploaded")).toBe(true);
  });

  it("includes whatsapp when customer chose whatsapp", () => {
    const events = buildOrderTimeline(
      makeOrder({ payment_proof_method: "whatsapp" }),
    );
    expect(events.some((e) => e.type === "proof_whatsapp")).toBe(true);
  });

  it("includes payment confirmed from payment_verified_at", () => {
    const events = buildOrderTimeline(
      makeOrder({
        payment_verified_at: "2026-06-02T10:00:00.000Z",
        estado: "confirmed",
      }),
    );
    const confirmed = events.find((e) => e.type === "payment_confirmed");
    expect(confirmed?.at).toBe("2026-06-02T10:00:00.000Z");
  });

  it("includes payment confirmed when estado is confirmed without verified_at", () => {
    const events = buildOrderTimeline(makeOrder({ estado: "confirmed" }));
    expect(events.some((e) => e.type === "payment_confirmed")).toBe(true);
  });

  it("includes status milestone for non-pending non-confirmed states", () => {
    const events = buildOrderTimeline(makeOrder({ estado: "in_production" }));
    expect(events.some((e) => e.type === "status_updated")).toBe(true);
  });
});
