import type { Locale } from "@shared/types";
import { storeConfig } from "@shared/store.config";

const localeMap: Record<Locale, string> = {
  es: "es-DO",
  en: "en-US",
};

export function formatMoney(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: storeConfig.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format stored digits for display, e.g. 18496202020 → +1 849 620 2020 */
export function formatPhoneDisplay(digits: string, locale: Locale): string {
  if (digits.length === 11 && digits.startsWith("1")) {
    const local = digits.slice(1);
    if (locale === "es") {
      return `+1 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
    }
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return `+${digits}`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeMap[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
