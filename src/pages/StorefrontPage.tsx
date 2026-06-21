import { useTranslation } from "react-i18next";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import type { Locale } from "@shared/types";
import { ProductCard } from "@/components/ProductCard";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { PendingOrderBanner } from "@/components/PendingOrderBanner";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getLocalized } from "@/lib/localized";

export function StorefrontPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { products, loading, error } = useProducts();
  const { isDrawerOpen } = useCart();
  const settings = useStoreConfig();
  const storeName = getLocalized(settings.storeName, locale);
  const description = getLocalized(settings.description, locale);

  usePageMeta({ title: storeName, description });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader />
      <PendingOrderBanner />

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-4 py-3 lg:overflow-hidden lg:px-8 lg:py-3 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {loading && <p className="text-gray-500">{t("common.loading")}</p>}
        {error && <p className="font-medium text-red-600">{error}</p>}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 lg:content-start lg:overflow-y-auto">
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
