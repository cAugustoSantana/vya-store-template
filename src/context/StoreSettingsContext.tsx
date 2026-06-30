import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PublicStoreSettings } from "@shared/storeSettings.types";
import { fetchStoreSettings } from "@/lib/api";
import { defaultPublicStoreSettings } from "@/lib/defaultStoreSettings";
import { applyPublicStoreSettings } from "@/lib/storeRuntime";
import { getLocalized } from "@shared/localized";
import { syncFavicon } from "@/lib/favicon";
import { syncLocaleFromStoreDefault } from "@/i18n";

function syncDocumentBranding(settings: PublicStoreSettings): void {
  document.title = getLocalized(settings.storeName, settings.defaultLocale);
  syncFavicon(settings.logoUrl);
}

type StoreSettingsContextValue = {
  settings: PublicStoreSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  settings: defaultPublicStoreSettings,
  loading: true,
  refresh: async () => {},
});

export function StoreSettingsProvider({
  children,
  initialSettings = defaultPublicStoreSettings,
}: {
  children: React.ReactNode;
  initialSettings?: PublicStoreSettings;
}) {
  const [settings, setSettings] = useState<PublicStoreSettings>(initialSettings);
  const loading = false;

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStoreSettings();
      setSettings(data.settings);
      applyPublicStoreSettings(data.settings);
      syncLocaleFromStoreDefault(data.settings.defaultLocale);
      syncDocumentBranding(data.settings);
    } catch {
      setSettings(defaultPublicStoreSettings);
      applyPublicStoreSettings(defaultPublicStoreSettings);
      syncLocaleFromStoreDefault(defaultPublicStoreSettings.defaultLocale);
      syncDocumentBranding(defaultPublicStoreSettings);
    }
  }, []);

  useEffect(() => {
    void refresh();
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
