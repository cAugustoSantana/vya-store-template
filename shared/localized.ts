import type { Locale } from "./types.js";
import { storeConfig } from "./store.config.js";

export type LocalizedRecord = Partial<Record<Locale, string>>;

/** Resolve a localized field; falls back to defaultLocale then any available value. */
export function resolveLocalized(
  field: LocalizedRecord | string,
  locale: Locale,
  defaultLocale: Locale = "es",
): string {
  if (typeof field === "string") return field;
  return field[locale] ?? field[defaultLocale] ?? field.es ?? field.en ?? "";
}

export type LocalizedField = LocalizedRecord | string;

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
