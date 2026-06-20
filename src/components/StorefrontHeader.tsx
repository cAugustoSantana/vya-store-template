import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Storefront } from "@phosphor-icons/react";
import { storeConfig } from "@shared/store.config";
import { getLocalized } from "@/lib/localized";
import type { Locale } from "@shared/types";

type Props = {
  showCatalogNav?: boolean;
  showAdminNav?: boolean;
};

export function StorefrontHeader({ showCatalogNav = true, showAdminNav = false }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-gray-200/80 bg-white shadow-sm shadow-gray-100/50 print:hidden">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Storefront size={16} weight="fill" aria-hidden />
          </div>
          <span className="truncate text-base font-bold tracking-tight text-gray-900">
            {getLocalized(storeConfig.storeName, locale)}
          </span>
        </Link>

        {(showCatalogNav || showAdminNav) && (
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {showCatalogNav && (
              <Link
                to="/"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                {t("storefront.title")}
              </Link>
            )}
            {showAdminNav && (
              <Link
                to="/admin"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                {t("nav.admin")}
              </Link>
            )}
          </nav>
        )}

        <div
          className="flex shrink-0 items-center rounded-md border border-gray-200/50 bg-gray-100/80 p-0.5"
          role="group"
          aria-label={t("locale.switchTo")}
        >
          {storeConfig.supportedLocales.map((l) => {
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                className={
                  active
                    ? "rounded border border-gray-200/50 bg-white px-2 py-1 text-xs font-semibold text-brand-600 shadow-sm"
                    : "rounded px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
                }
                aria-pressed={active}
                onClick={() => i18n.changeLanguage(l)}
              >
                {t(`locale.${l}`)}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
