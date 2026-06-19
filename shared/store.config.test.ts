import { describe, it, expect } from "vitest";
import { storeConfig } from "./store.config";

describe("storeConfig", () => {
  it("has demo products and payment_confirmation_pending default", () => {
    expect(storeConfig.products.length).toBeGreaterThanOrEqual(2);
    expect(storeConfig.defaultOrderStatus).toBe("payment_confirmation_pending");
    expect(storeConfig.payment.provider).toBe("bank_transfer_proof");
  });

  it("products have localized names and variant keys", () => {
    const shirt = storeConfig.products.find((p) => p.id === "prod-1");
    expect(shirt?.name.es).toBeTruthy();
    expect(shirt?.name.en).toBeTruthy();
    expect(shirt?.variantOptions.size?.values.m).toBeDefined();
  });
});
