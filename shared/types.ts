export type Locale = "es" | "en";

export type LocalizedString = Record<Locale, string>;

export type OrderStatus =
  | "payment_confirmation_pending"
  | "confirmed"
  | "in_production"
  | "delivered"
  | "cancelled";

export type PaymentProvider = "bank_transfer_proof" | "stripe" | "azul";

export type PaymentProofMethod = "upload" | "whatsapp";
