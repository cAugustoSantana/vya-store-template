import type { Locale } from "../../../shared/types";
import { storeConfig } from "../config";
import { getBankTransferDetails } from "../email";

export type PaymentInstructions = {
  provider: typeof storeConfig.payment.provider;
  bankTransfer: ReturnType<typeof getBankTransferDetails>;
};

export function getPaymentInstructions(locale: Locale): PaymentInstructions {
  return {
    provider: storeConfig.payment.provider,
    bankTransfer: getBankTransferDetails(locale),
  };
}

export function assertPaymentProviderConfigured(provider: string): void {
  if (provider === "stripe" || provider === "azul") {
    throw new Error(`${provider}_not_configured`);
  }
}
