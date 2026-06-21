import type { Locale } from "./types";
import type { Product } from "./product.types";
import { resolveLocalized } from "./localized";

export function productName(product: Product, locale: Locale, defaultLocale: Locale = "es"): string {
  return resolveLocalized(product.name, locale, defaultLocale);
}

export function productDescription(
  product: Product,
  locale: Locale,
  defaultLocale: Locale = "es",
): string {
  return resolveLocalized(product.description, locale, defaultLocale);
}
