import { storeConfig } from "@shared/store.config";
import type { PublicStoreSettings } from "@shared/storeSettings.types";

export const defaultPublicStoreSettings: PublicStoreSettings = {
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
};
