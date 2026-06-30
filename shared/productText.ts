import type { Locale } from "./types.js";

/** Read product name/description from DB JSONB (legacy localized object or plain string). */
export function productTextFromStored(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Partial<Record<Locale, string>>;
    const es = record.es?.trim();
    const en = record.en?.trim();
    if (es && en && es !== en) return es;
    return es || en || Object.values(record).find((v) => typeof v === "string" && v.trim())?.trim() || "";
  }
  return "";
}

/** Accept plain string or legacy localized object from API/admin forms. */
export function normalizeProductTextInput(value: unknown): string {
  return productTextFromStored(value);
}

/** Persist the same text for all locales (language-agnostic catalog copy). */
export function productTextToStored(value: string): Record<Locale, string> {
  const trimmed = value.trim();
  return { es: trimmed, en: trimmed };
}
