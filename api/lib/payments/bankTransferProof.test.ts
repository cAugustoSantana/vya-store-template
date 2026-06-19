/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import {
  getPaymentInstructions,
  assertPaymentProviderConfigured,
} from "./bankTransferProof";
import { getPaymentProvider } from "./index";

describe("bankTransferProof", () => {
  it("returns bank transfer instructions for locale", () => {
    const instructions = getPaymentInstructions("es");
    expect(instructions.provider).toBe("bank_transfer_proof");
    expect(instructions.bankTransfer.accountNumber).toBe("1234567890");
    expect(instructions.bankTransfer.bankName).toBeTruthy();
  });

  it("localizes bank name by locale", () => {
    const es = getPaymentInstructions("es");
    const en = getPaymentInstructions("en");
    expect(es.bankTransfer.accountType).not.toBe(en.bankTransfer.accountType);
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
  it("exposes getInstructions", () => {
    const provider = getPaymentProvider();
    const instructions = provider.getInstructions("en");
    expect(instructions.provider).toBe("bank_transfer_proof");
  });
});
