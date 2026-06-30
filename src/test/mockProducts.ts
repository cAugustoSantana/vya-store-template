import { vi } from "vitest";
import type { Product } from "@shared/product.types";
import { storeConfig } from "@shared/store.config";
import type { PublicStoreSettings } from "@shared/storeSettings.types";

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Camiseta Básica",
    description: "Algodón suave, corte regular",
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
    active: true,
    sortOrder: 0,
    stockQuantity: 100,
  },
  {
    id: "prod-2",
    name: "Gorra Logo",
    description: "Gorra ajustable con logo bordado",
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
    active: true,
    sortOrder: 1,
    stockQuantity: 100,
  },
];

export function mockPublicStoreSettings(): { settings: PublicStoreSettings } {
  return {
    settings: {
      storeSlug: storeConfig.storeSlug,
      storeName: storeConfig.storeName,
      description: storeConfig.description,
      defaultLocale: storeConfig.defaultLocale,
      supportedLocales: [...storeConfig.supportedLocales],
      currency: storeConfig.currency,
      taxRate: storeConfig.taxRate,
      primaryColor: storeConfig.primaryColor,
      logoUrl: storeConfig.logoUrl,
      phone: storeConfig.phone,
      contact: {
        whatsappCountryCode: storeConfig.contact.whatsappCountryCode,
        whatsappNumber: storeConfig.contact.whatsappNumber,
        instagramUrl: storeConfig.contact.instagramUrl,
      },
      payment: storeConfig.payment,
      orderStatuses: [...storeConfig.orderStatuses],
      defaultOrderStatus: storeConfig.defaultOrderStatus,
    },
  };
}

export function mockProductsFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes("/api/products")) {
        return new Response(JSON.stringify({ products: mockProducts }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/settings")) {
        return new Response(JSON.stringify(mockPublicStoreSettings()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unmocked fetch: ${url}`);
    }),
  );
}
