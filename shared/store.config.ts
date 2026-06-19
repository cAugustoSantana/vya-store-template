import type { Locale, OrderStatus, PaymentProvider } from "./types";

export type LocalizedField = Record<Locale, string>;

export type VariantValue = Record<Locale, string>;

export type VariantGroup = {
  label: LocalizedField;
  values: Record<string, VariantValue>;
};

export type Product = {
  id: string;
  name: LocalizedField;
  description: LocalizedField;
  price: number;
  imageUrl: string;
  variantOptions: Record<string, VariantGroup>;
};

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
      bankName: { es: "Banco Popular", en: "Banco Popular" },
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
  products: [
    {
      id: "prod-1",
      name: { es: "Camiseta Básica", en: "Basic T-shirt" },
      description: {
        es: "Algodón suave, corte regular",
        en: "Soft cotton, regular fit",
      },
      price: 1500,
      imageUrl: "/products/prod-1.svg",
      variantOptions: {
        size: {
          label: { es: "Talla", en: "Size" },
          values: {
            s: { es: "S", en: "S" },
            m: { es: "M", en: "M" },
            l: { es: "L", en: "L" },
            xl: { es: "XL", en: "XL" },
          },
        },
        color: {
          label: { es: "Color", en: "Color" },
          values: {
            black: { es: "Negro", en: "Black" },
            white: { es: "Blanco", en: "White" },
          },
        },
      },
    },
    {
      id: "prod-2",
      name: { es: "Gorra Logo", en: "Logo Cap" },
      description: {
        es: "Gorra ajustable con logo bordado",
        en: "Adjustable cap with embroidered logo",
      },
      price: 900,
      imageUrl: "/products/prod-2.svg",
      variantOptions: {
        color: {
          label: { es: "Color", en: "Color" },
          values: {
            navy: { es: "Azul marino", en: "Navy" },
            black: { es: "Negro", en: "Black" },
          },
        },
      },
    },
  ] satisfies Product[],
};

export type StoreConfig = typeof storeConfig;
