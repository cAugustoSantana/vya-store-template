import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import type { Locale } from "@shared/types";
import { toAbsoluteUrl } from "@shared/socialMeta";
import { ProductCard } from "@/components/ProductCard";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { PendingOrderBanner } from "@/components/PendingOrderBanner";
import { buildPageOrigin, usePageMeta } from "@/hooks/usePageMeta";
import { getLocalized } from "@/lib/localized";
import { resolvePublicLogoUrl } from "@/lib/logoUrl";

export function StorefrontPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const settings = useStoreConfig();
  const { products, loading, error } = useProducts();
  const { isDrawerOpen } = useCart();

  const pageMeta = useMemo(() => {
    const origin = buildPageOrigin();
    const logoPath = resolvePublicLogoUrl(settings.logoUrl);
    return {
      title: getLocalized(settings.storeName, locale),
      description: getLocalized(settings.description, locale),
      url: `${origin}/`,
      image: settings.logoUrl.trim() ? toAbsoluteUrl(origin, logoPath) : undefined,
      type: "website" as const,
      siteName: getLocalized(settings.storeName, locale),
    };
  }, [settings, locale]);

  usePageMeta(pageMeta);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900 lg:h-[100dvh] lg:overflow-hidden">
      <StorefrontHeader />
      <PendingOrderBanner />

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:min-h-0 lg:overflow-hidden lg:px-8 lg:py-3 lg:pb-3 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {loading && <p className="text-gray-500">{t("common.loading")}</p>}
        {error && <p className="font-medium text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:gap-5 lg:content-start lg:overflow-y-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </main>

      <StorefrontFooter />
      <CartDrawer />
    </div>
  );
}
