import type { Locale } from "@shared/types";
import { storeConfig } from "@shared/store.config";

export type LocalizedField = Partial<Record<Locale, string>> | string;

/** Resolve a localized config field; falls back to defaultLocale then any available value. */
export function getLocalized(field: LocalizedField, locale: Locale): string {
  if (typeof field === "string") return field;
  return (
    field[locale] ??
    field[storeConfig.defaultLocale] ??
    field.es ??
    field.en ??
    ""
  );
}
