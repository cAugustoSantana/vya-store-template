export type Locale = "es" | "en";

export type LocalizedString = Record<Locale, string>;

export type OrderStatus =
  | "payment_confirmation_pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentProvider = "bank_transfer_proof" | "stripe" | "azul";

export type PaymentProofMethod = "upload" | "whatsapp";
