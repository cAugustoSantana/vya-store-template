import type { Locale } from "../../../shared/types";
import { getPaymentInstructions } from "./bankTransferProof";

export { getPaymentInstructions, assertPaymentProviderConfigured } from "./bankTransferProof";

export function getPaymentProvider() {
  return {
    getInstructions: (locale: Locale) => getPaymentInstructions(locale),
  };
}
