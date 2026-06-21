import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storeConfig } from "@shared/store.config";
import type { PublicStoreSettings } from "@shared/storeSettings.types";
import { fetchStoreSettings } from "@/lib/api";
import { bootstrapStoreSettings } from "@/lib/bootstrapStoreSettings";
import { syncLocaleFromStoreDefault } from "@/i18n";

type StoreSettingsContextValue = {
  settings: PublicStoreSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const defaultSettings: PublicStoreSettings = {
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

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {},
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicStoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStoreSettings();
      setSettings(data.settings);
      bootstrapStoreSettings(data.settings);
      syncLocaleFromStoreDefault(data.settings.defaultLocale);
    } catch {
      setSettings(defaultSettings);
      bootstrapStoreSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, loading, refresh }),
    [settings, loading, refresh],
  );

  return (
    <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreConfig(): PublicStoreSettings {
  return useContext(StoreSettingsContext).settings;
}

export function useStoreSettingsState() {
  return useContext(StoreSettingsContext);
}
