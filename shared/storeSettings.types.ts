import type { Locale, OrderStatus, PaymentProvider } from "./types";

export type LocalizedStoreField = Record<Locale, string>;

export type StoreSettingsData = {
  storeSlug: string;
  storeName: LocalizedStoreField;
  description: LocalizedStoreField;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  currency: string;
  taxRate: number;
  primaryColor: string;
  logoUrl: string;
  phone: { defaultCountryCode: string; localDigits: number };
  email: { from: string };
  contact: {
    whatsappCountryCode: string;
    whatsappNumber: string;
    instagramUrl: string;
    ownerEmail: string;
  };
  payment: {
    provider: PaymentProvider;
    bankTransfer: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      accountType: LocalizedStoreField;
      referenceHint: LocalizedStoreField;
    };
  };
  orderStatuses: readonly OrderStatus[];
  defaultOrderStatus: OrderStatus;
};

export type PublicStoreSettings = Omit<StoreSettingsData, "email" | "contact"> & {
  contact: Omit<StoreSettingsData["contact"], "ownerEmail">;
};
