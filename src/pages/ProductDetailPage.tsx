import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
} from "@phosphor-icons/react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { SizeGuideDialog } from "@/components/SizeGuideDialog";
import { ProductGallery } from "@/components/ProductGallery";
import { buildPageOrigin, usePageMeta } from "@/hooks/usePageMeta";
import { getLocalized } from "@/lib/localized";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import { productDetailImageFrameClass } from "@/lib/productImageLayout";
import { formatMoney } from "@/lib/format";
import { maxPurchasableQuantity, productStock } from "@/lib/inventory";
import { resolveProductLinePrice, variantStock } from "@shared/productVariants";
import { isOptionValueAvailable } from "@/lib/variantAvailability";
import { toAbsoluteUrl } from "@shared/socialMeta";
import {
  colorSwatchClass,
  defaultVariants,
  isColorVariant,
  isSizeVariant,
} from "@/lib/variantSwatches";
import type { Locale } from "@shared/types";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { getProduct, loading } = useProducts();
  const { addLine, isDrawerOpen, lines } = useCart();
  const settings = useStoreConfig();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const product = productId ? getProduct(productId) : undefined;

  const pageMeta = useMemo(() => {
    if (!product) return null;
    const origin = buildPageOrigin();
    const imagePath = resolvePublicProductImageUrl(product.id, product.imageUrl);
    return {
      title: product.name,
      description: product.name,
      url: `${origin}/products/${encodeURIComponent(product.id)}`,
      image: product.imageUrl.trim() ? toAbsoluteUrl(origin, imagePath) : undefined,
      type: "product" as const,
      siteName: getLocalized(settings.storeName, locale),
    };
  }, [product, settings.storeName, locale]);

  usePageMeta(pageMeta);

  const variantKeys = useMemo(
    () => (product ? Object.keys(product.variantOptions) : []),
    [product],
  );

  const [variants, setVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setVariants(defaultVariants(product.variantOptions));
    setQuantity(1);
  }, [product]);

  const resolvedVariants = useMemo(() => {
    if (!product) return variants;
    const next = { ...variants };
    for (const key of variantKeys) {
      if (!next[key]) {
        const values = Object.keys(product.variantOptions[key].values);
        if (values[0]) next[key] = values[0];
      }
    }
    return next;
  }, [product, variantKeys, variants]);

  const allSelected = variantKeys.every((k) => resolvedVariants[k]);
  const selectedStock = product
    ? variantKeys.length > 0
      ? variantStock(product, resolvedVariants)
      : productStock(product)
    : 0;
  const inStock = selectedStock > 0;
  const maxQty = product ? maxPurchasableQuantity(product, lines, resolvedVariants) : 0;
  const displayPrice = product ? resolveProductLinePrice(product, resolvedVariants) : 0;

  useEffect(() => {
    if (!product) return;
    setQuantity((current) => Math.min(current, Math.max(1, maxQty)));
  }, [product, maxQty]);

  const selectedColorLabel = useMemo(() => {
    if (!product) return "";
    const colorKey = variantKeys.find(isColorVariant);
    if (!colorKey) return "";
    const valueKey = resolvedVariants[colorKey];
    const value = product.variantOptions[colorKey]?.values[valueKey];
    return value ? getLocalized(value, locale) : valueKey;
  }, [product, variantKeys, resolvedVariants, locale]);

  const selectedSizeKey = useMemo(() => {
    if (!product) return undefined;
    const sizeKey = variantKeys.find(isSizeVariant);
    return sizeKey ? resolvedVariants[sizeKey] : undefined;
  }, [product, variantKeys, resolvedVariants]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50/50 font-sans">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-gray-50/50 font-sans text-gray-900">
        <StorefrontHeader />
        <main className="mx-auto flex flex-1 flex-col items-center justify-center px-4 py-8 text-center lg:px-8">
          <p className="text-gray-500">{t("productDetail.notFound")}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline"
          >
            <ArrowLeft size={18} weight="bold" aria-hidden />
            {t("productDetail.backToCatalog")}
          </Link>
        </main>
      </div>
    );
  }

  const name = product.name;
  const description = product.description;

  const handleAdd = () => {
    if (!allSelected || quantity < 1 || !inStock || maxQty <= 0) return;
    addLine({
      productId: product.id,
      variants: { ...resolvedVariants },
      quantity: Math.min(quantity, maxQty),
    });
  };

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900 lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <StorefrontHeader />

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col min-h-0 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-5 lg:px-8 lg:py-3 lg:pb-3 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <div className="mb-2 shrink-0 lg:mb-2">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-600 lg:gap-2 lg:text-base"
          >
            <ArrowLeft
              size={18}
              weight="bold"
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            {t("productDetail.backToCatalog")}
          </Link>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,34%)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 overflow-hidden lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-4">
          <div className="col-start-1 row-start-1 max-w-[9.5rem] self-start lg:col-span-7 lg:max-w-none lg:row-span-2">
            <ProductGallery
              productId={product.id}
              imageUrl={product.imageUrl}
              alt={name}
              zoomLabel={t("productDetail.viewFullImage")}
              closeLabel={t("cart.close")}
              frameClass={productDetailImageFrameClass}
            />
          </div>

          <div className="col-start-2 row-start-1 flex min-w-0 flex-col justify-center gap-1 lg:col-span-5 lg:col-start-8 lg:justify-start lg:gap-3">
            <h1 className="line-clamp-3 text-lg font-black leading-tight tracking-tight text-gray-900 lg:line-clamp-none lg:text-4xl">
              {name}
            </h1>
            <div className="text-xl font-extrabold text-brand-600 lg:text-3xl">
              {formatMoney(displayPrice, locale)}
            </div>
            <p className="hidden text-sm leading-relaxed text-gray-600 lg:block">
              {description}
            </p>
          </div>

          <div className="col-span-2 row-start-2 flex min-h-0 flex-col gap-2 overflow-hidden lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:gap-3">
              {variantKeys.map((key) => {
                const group = product.variantOptions[key];
                const label = getLocalized(group.label, locale);

                if (isColorVariant(key)) {
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between lg:mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                          {t("productDetail.selectColor")}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {selectedColorLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:gap-3">
                        {Object.entries(group.values).map(([valueKey]) => {
                          const selected = resolvedVariants[key] === valueKey;
                          return (
                            <button
                              key={valueKey}
                              type="button"
                              aria-label={getLocalized(group.values[valueKey], locale)}
                              aria-pressed={selected}
                              onClick={() =>
                                setVariants((prev) => ({ ...prev, [key]: valueKey }))
                              }
                              className={`h-8 w-8 rounded-full transition-all lg:h-10 lg:w-10 ${colorSwatchClass(valueKey)} ${
                                selected
                                  ? "border-2 border-brand-500 ring-2 ring-brand-100 ring-offset-2"
                                  : "border border-gray-200 hover:border-brand-300"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (isSizeVariant(key)) {
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between lg:mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                          {t("productDetail.selectSize")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="text-xs font-bold text-brand-600 underline underline-offset-4 hover:text-brand-700"
                        >
                          {t("productDetail.sizeGuide")}
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 lg:gap-3">
                        {Object.entries(group.values).map(([valueKey, valueLabel]) => {
                          const selected = resolvedVariants[key] === valueKey;
                          const available = isOptionValueAvailable(
                            product,
                            key,
                            valueKey,
                            resolvedVariants,
                          );
                          const display = getLocalized(valueLabel, locale);
                          return (
                            <button
                              key={valueKey}
                              type="button"
                              aria-pressed={selected}
                              disabled={!available}
                              onClick={() =>
                                setVariants((prev) => ({ ...prev, [key]: valueKey }))
                              }
                              className={
                                !available
                                  ? "rounded-lg border border-gray-200 px-2 py-2 text-sm font-bold text-gray-300 line-through lg:px-3 lg:py-2"
                                  : selected
                                    ? "rounded-lg border-2 border-brand-600 bg-brand-50 px-2 py-2 text-sm font-bold text-brand-600 transition-all lg:px-3 lg:py-2"
                                    : "rounded-lg border border-gray-200 px-2 py-2 text-sm font-bold text-gray-700 transition-all hover:border-brand-500 hover:bg-brand-50 lg:px-3 lg:py-2"
                              }
                            >
                              {display}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label
                      htmlFor={`variant-${key}`}
                      className="mb-1.5 block text-sm font-bold uppercase tracking-wider text-gray-900 lg:mb-4"
                    >
                      {label}
                    </label>
                    <select
                      id={`variant-${key}`}
                      value={resolvedVariants[key] ?? ""}
                      onChange={(e) =>
                        setVariants((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="custom-select block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-semibold text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                    >
                      {Object.entries(group.values).map(([valueKey, valueLabel]) => (
                        <option key={valueKey} value={valueKey}>
                          {getLocalized(valueLabel, locale)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div className="mt-auto shrink-0 border-t border-gray-100 pt-2 lg:pt-3">
                {!inStock ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-center text-sm font-bold text-gray-600">
                    {t("productDetail.soldOut")}
                  </div>
                ) : (
                <div className="flex gap-2 lg:gap-3">
                  <div className="flex h-11 w-[7.5rem] items-center rounded-xl border border-gray-200 bg-gray-50 p-1 lg:h-11 lg:w-[120px]">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="flex h-full w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900 disabled:opacity-40"
                      aria-label={t("productDetail.decreaseQty")}
                    >
                      <Minus size={16} weight="bold" aria-hidden />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-full flex-1 border-none bg-transparent p-0 text-center text-lg font-bold text-gray-900 focus:outline-none"
                      aria-label={t("storefront.quantity")}
                    />
                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={quantity >= maxQty}
                      className="flex h-full w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900 disabled:opacity-40"
                      aria-label={t("productDetail.increaseQty")}
                    >
                      <Plus size={16} weight="bold" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={!allSelected || maxQty <= 0}
                    onClick={handleAdd}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 lg:px-4 lg:py-3"
                  >
                    <ShoppingCart size={20} weight="bold" aria-hidden />
                    {t("storefront.addToOrder")}
                  </button>
                </div>
                )}
                {inStock && maxQty > 0 ? (
                  <p className="mt-1 text-[11px] font-medium text-gray-500 lg:mt-2 lg:text-xs">
                    {t("productDetail.unitsAvailable", { count: maxQty })}
                  </p>
                ) : null}
              </div>
          </div>
        </div>
      </main>

      <SizeGuideDialog
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        selectedSizeKey={selectedSizeKey}
      />
      <StorefrontFooter className="hidden lg:block" />
      <CartDrawer />
    </div>
  );
}
