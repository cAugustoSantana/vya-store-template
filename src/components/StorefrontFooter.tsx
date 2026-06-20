import { useTranslation } from "react-i18next";
import { Storefront } from "@phosphor-icons/react";
import { storeConfig } from "@shared/store.config";
import { getLocalized } from "@/lib/localized";
import type { Locale } from "@shared/types";

export function StorefrontFooter() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200/80 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            <Storefront size={18} weight="fill" aria-hidden />
          </div>
          <span className="font-bold text-gray-500">
            {getLocalized(storeConfig.storeName, locale)} © {year}
          </span>
        </div>
        <div className="flex gap-8 text-sm font-semibold text-gray-400">
          <span>{t("productDetail.termsOfService")}</span>
          <span>{t("productDetail.shippingPolicy")}</span>
          <span>{t("productDetail.contactSupport")}</span>
        </div>
      </div>
    </footer>
  );
}
