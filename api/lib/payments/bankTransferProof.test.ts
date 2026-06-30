/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import {
  getPaymentInstructions,
  assertPaymentProviderConfigured,
} from "./bankTransferProof.js";
import { getPaymentProvider } from "./index.js";

describe("bankTransferProof", () => {
  it("returns bank transfer instructions for locale", async () => {
    const instructions = await getPaymentInstructions("es");
    expect(instructions.provider).toBe("bank_transfer_proof");
    expect(instructions.bankTransfer.instructions).toContain("1234567890");
    expect(instructions.bankTransfer.instructions).toBeTruthy();
  });

  it("localizes instructions by locale", async () => {
    const es = await getPaymentInstructions("es");
    const en = await getPaymentInstructions("en");
    expect(es.bankTransfer.instructions).toContain("Banco:");
    expect(en.bankTransfer.instructions).toContain("Bank:");
  });

  it("throws for unconfigured stripe/azul providers", () => {
    expect(() => assertPaymentProviderConfigured("stripe")).toThrow(
      "stripe_not_configured",
    );
    expect(() => assertPaymentProviderConfigured("azul")).toThrow(
      "azul_not_configured",
    );
  });
});

describe("getPaymentProvider", () => {
  it("exposes getInstructions", async () => {
    const provider = getPaymentProvider();
    const instructions = await provider.getInstructions("en");
    expect(instructions.provider).toBe("bank_transfer_proof");
  });
});
