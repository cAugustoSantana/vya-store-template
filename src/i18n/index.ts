import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import type { Locale } from "@shared/types";
import es from "./locales/es.json";
import en from "./locales/en.json";

export const LOCALE_STORAGE_KEY = "store-locale";

function detectLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && storeConfig.supportedLocales.includes(stored as Locale)) {
      return stored as Locale;
    }
    const browser = navigator.language.slice(0, 2);
    if (storeConfig.supportedLocales.includes(browser as Locale)) {
      return browser as Locale;
    }
  }
  return storeConfig.defaultLocale;
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: detectLocale(),
  fallbackLng: storeConfig.defaultLocale,
  supportedLngs: [...storeConfig.supportedLocales],
  interpolation: { escapeValue: false },
});

export function setAppLocale(locale: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
