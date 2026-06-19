/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { createStripeProvider } from "./stripe";

describe("stripe provider stub", () => {
  it("throws not configured", () => {
    expect(() => createStripeProvider()).toThrow("stripe_not_configured");
  });
});
