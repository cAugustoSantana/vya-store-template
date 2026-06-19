import { useTranslation } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import type { Locale } from "@shared/types";
import { setAppLocale } from "@/i18n";
import styles from "./LocaleSwitcher.module.css";

export function LocaleSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.language as Locale;

  return (
    <div className={styles.switcher} role="group" aria-label={t("locale.switchTo")}>
      {storeConfig.supportedLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          className={current === locale ? styles.active : styles.button}
          aria-pressed={current === locale}
          onClick={() => setAppLocale(locale)}
        >
          {t(`locale.${locale}`)}
        </button>
      ))}
    </div>
  );
}
