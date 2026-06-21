import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "@phosphor-icons/react";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { useCart } from "@/context/CartContext";
import { getLocalized } from "@/lib/localized";
import { resolvePublicLogoUrl } from "@/lib/logoUrl";
import type { Locale } from "@shared/types";

export function StorefrontHeader() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const settings = useStoreConfig();
  const { lines, openDrawer } = useCart();
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const logoSrc = resolvePublicLogoUrl(settings.logoUrl);
  const storeName = getLocalized(settings.storeName, locale);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-gray-200/80 bg-white shadow-sm shadow-gray-100/50 print:hidden">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src={logoSrc}
            alt={storeName}
            className="h-8 w-8 shrink-0 rounded-lg object-contain"
          />
          <span className="truncate text-base font-bold tracking-tight text-gray-900">
            {storeName}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex items-center rounded-md border border-gray-200/50 bg-gray-100/80 p-0.5"
            role="group"
            aria-label={t("locale.switchTo")}
          >
            {settings.supportedLocales.map((l) => {
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

          <button
            type="button"
            onClick={openDrawer}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
            aria-label={t("cart.title")}
          >
            <ShoppingCart size={18} weight="bold" aria-hidden />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
