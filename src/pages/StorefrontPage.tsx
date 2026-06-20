import { useTranslation } from "react-i18next";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import type { Locale } from "@shared/types";
import { ProductCard } from "@/components/ProductCard";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";
import { PendingOrderBanner } from "@/components/PendingOrderBanner";

export function StorefrontPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { products, loading, error } = useProducts();
  const { isDrawerOpen } = useCart();

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader showAdminNav />
      <PendingOrderBanner />

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-4 py-3 lg:overflow-hidden lg:px-8 lg:py-3 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <div className="mb-3 shrink-0 lg:mb-2">
          <h1 className="mb-0.5 text-xl font-extrabold tracking-tight text-gray-900 lg:text-2xl">
            {t("storefront.title")}
          </h1>
          <p className="text-xs text-gray-500 lg:text-sm">{t("storefront.subtitle")}</p>
        </div>

        {loading && <p className="text-gray-500">{t("common.loading")}</p>}
        {error && <p className="font-medium text-red-600">{error}</p>}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 lg:content-start lg:overflow-y-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </main>

      <CartDrawer />
    </div>
  );
}
