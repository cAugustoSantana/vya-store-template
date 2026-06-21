import type { PublicStoreSettings } from "@shared/storeSettings.types";
import { storeConfig } from "@shared/store.config";
import { applyBrandPaletteToDocument } from "@/lib/brandPalette";

let currency = storeConfig.currency;
let primaryColor = storeConfig.primaryColor;

export function getStoreCurrency(): string {
  return currency;
}

export function getStorePrimaryColor(): string {
  return primaryColor;
}

export function applyPublicStoreSettings(settings: PublicStoreSettings): void {
  currency = settings.currency;
  primaryColor = settings.primaryColor;
  applyBrandPaletteToDocument(settings.primaryColor);
}
