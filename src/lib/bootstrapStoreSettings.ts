import type { PublicStoreSettings } from "@shared/storeSettings.types";
import { fetchStoreSettings } from "@/lib/api";
import { defaultPublicStoreSettings } from "@/lib/defaultStoreSettings";
import { applyPublicStoreSettings } from "@/lib/storeRuntime";
import { getLocalized } from "@shared/localized";
import { syncFavicon } from "@/lib/favicon";
import { syncLocaleFromStoreDefault } from "@/i18n";

export async function loadStoreSettings(): Promise<PublicStoreSettings> {
  try {
    const data = await fetchStoreSettings();
    applyPublicStoreSettings(data.settings);
    syncLocaleFromStoreDefault(data.settings.defaultLocale);
    document.title = getLocalized(data.settings.storeName, data.settings.defaultLocale);
    syncFavicon(data.settings.logoUrl);
    return data.settings;
  } catch {
    applyPublicStoreSettings(defaultPublicStoreSettings);
    syncLocaleFromStoreDefault(defaultPublicStoreSettings.defaultLocale);
    document.title = getLocalized(
      defaultPublicStoreSettings.storeName,
      defaultPublicStoreSettings.defaultLocale,
    );
    syncFavicon(defaultPublicStoreSettings.logoUrl);
    return defaultPublicStoreSettings;
  }
}
