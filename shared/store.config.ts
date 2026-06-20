import type { Locale, OrderStatus, PaymentProvider } from "./types";
export type {
  Product,
  LocalizedField,
  VariantGroup,
  VariantValue,
} from "./product.types";

export const storeConfig = {
  storeSlug: "MITIENDA",
  storeName: { es: "Mi Tienda", en: "My Store" },
  description: {
    es: "Ropa y accesorios con pedidos en línea",
    en: "Clothing and accessories with online ordering",
  },
  defaultLocale: "es" as Locale,
  supportedLocales: ["es", "en"] as const,
  currency: "DOP",
  taxRate: 0.18,
  primaryColor: "#2563eb",
  logoUrl: "/logo.svg",
  phone: { defaultCountryCode: "1", localDigits: 10 },
  email: { from: "Pedidos Mi Tienda <pedidos@mitienda.com>" },
  contact: {
    whatsappCountryCode: "1",
    whatsappNumber: "8095551234",
    instagramUrl: "https://www.instagram.com/mitienda",
    ownerEmail: "owner@mitienda.com",
  },
  payment: {
    provider: "bank_transfer_proof" as PaymentProvider,
    bankTransfer: {
      bankName: "Banco Popular",
      accountName: "Mi Tienda SRL",
      accountNumber: "1234567890",
      accountType: { es: "Ahorros", en: "Savings" },
      referenceHint: {
        es: "Usa tu número de pedido como referencia de transferencia",
        en: "Use your order number as the transfer reference",
      },
    },
  },
  orderStatuses: [
    "payment_confirmation_pending",
    "confirmed",
    "in_production",
    "delivered",
    "cancelled",
  ] as const satisfies readonly OrderStatus[],
  defaultOrderStatus: "payment_confirmation_pending" as OrderStatus,
};

export type StoreConfig = typeof storeConfig;
