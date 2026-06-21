import type { Locale } from "./types";

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
