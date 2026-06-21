import type { PublicStoreSettings } from "@shared/storeSettings.types";
import { applyBrandPaletteToDocument } from "@/lib/brandPalette";
import { syncFavicon } from "@/lib/favicon";
import { applyPublicStoreSettings } from "@/lib/storeRuntime";

export function bootstrapStoreSettings(settings: PublicStoreSettings): void {
  applyPublicStoreSettings(settings);
  applyBrandPaletteToDocument(settings.primaryColor);
  syncFavicon(settings.logoUrl);
}
