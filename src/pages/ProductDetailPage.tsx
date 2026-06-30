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
    <div className="flex min-h-[100dvh] flex-col bg-white font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900 lg:bg-gray-50/50">
      <StorefrontHeader />

      <main
        className={`mx-auto w-full max-w-[1440px] flex-1 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-5 lg:px-8 lg:py-3 lg:pb-3 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <div className="mb-3 hidden shrink-0 lg:block">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 font-semibold text-gray-500 transition-colors hover:text-brand-600"
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

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="mb-3 flex items-start justify-between gap-4 lg:col-span-5 lg:col-start-8 lg:mb-4 lg:hidden">
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-snug tracking-tight text-gray-900">
                {name}
              </h1>
              {selectedColorLabel ? (
                <p className="mt-0.5 text-sm text-gray-500">{selectedColorLabel}</p>
              ) : (
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{description}</p>
              )}
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums text-gray-900">
              {formatMoney(displayPrice, locale)}
            </p>
          </div>

          <div className="-mx-4 mb-0 sm:-mx-5 lg:col-span-7 lg:mx-0 lg:mb-0">
            <ProductGallery
              productId={product.id}
              imageUrl={product.imageUrl}
              alt={name}
              zoomLabel={t("productDetail.viewFullImage")}
              closeLabel={t("cart.close")}
              frameClass={productDetailImageFrameClass}
            />
          </div>

          <div className="flex flex-col lg:col-span-5 lg:gap-4">
            <div className="hidden lg:block lg:space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-gray-900">{name}</h1>
              <div className="text-3xl font-extrabold text-brand-600">
                {formatMoney(displayPrice, locale)}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{description}</p>
            </div>

            <div className="divide-y divide-gray-200 border-b border-gray-200 lg:divide-none lg:border-b-0">
              {variantKeys.map((key) => {
                const group = product.variantOptions[key];
                const label = getLocalized(group.label, locale);

                if (isColorVariant(key)) {
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 py-3.5 lg:block lg:space-y-2 lg:py-0"
                    >
                      <span className="shrink-0 text-sm text-gray-900 lg:text-sm lg:font-bold lg:uppercase lg:tracking-wider">
                        <span className="lg:hidden">{t("productDetail.colorLabel")}</span>
                        <span className="hidden lg:inline">{t("productDetail.selectColor")}</span>
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-2 lg:justify-start lg:gap-3">
                        {Object.entries(group.values).map(([valueKey, valueLabel]) => {
                          const selected = resolvedVariants[key] === valueKey;
                          const display = getLocalized(valueLabel, locale);
                          return (
                            <button
                              key={valueKey}
                              type="button"
                              aria-label={display}
                              aria-pressed={selected}
                              onClick={() =>
                                setVariants((prev) => ({ ...prev, [key]: valueKey }))
                              }
                              className={`text-sm transition-colors lg:hidden ${
                                selected
                                  ? "font-semibold text-gray-900 underline underline-offset-4"
                                  : "text-gray-400 hover:text-gray-700"
                              }`}
                            >
                              {display}
                            </button>
                          );
                        })}
                        {Object.entries(group.values).map(([valueKey]) => {
                          const selected = resolvedVariants[key] === valueKey;
                          return (
                            <button
                              key={`swatch-${valueKey}`}
                              type="button"
                              aria-label={getLocalized(group.values[valueKey], locale)}
                              aria-pressed={selected}
                              onClick={() =>
                                setVariants((prev) => ({ ...prev, [key]: valueKey }))
                              }
                              className={`hidden h-10 w-10 rounded-full transition-all lg:inline-flex ${colorSwatchClass(valueKey)} ${
                                selected
                                  ? "border-2 border-brand-500 ring-2 ring-brand-100 ring-offset-2"
                                  : "border border-gray-200 hover:border-brand-300"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="hidden text-xs font-bold text-gray-500 lg:inline">
                        {selectedColorLabel}
                      </span>
                    </div>
                  );
                }

                if (isSizeVariant(key)) {
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 py-3.5 lg:block lg:space-y-2 lg:py-0"
                    >
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm text-gray-900 lg:text-sm lg:font-bold lg:uppercase lg:tracking-wider">
                          <span className="lg:hidden">{t("productDetail.sizeLabel")}</span>
                          <span className="hidden lg:inline">{t("productDetail.selectSize")}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="hidden text-xs font-bold text-brand-600 underline underline-offset-4 hover:text-brand-700 lg:inline"
                        >
                          {t("productDetail.sizeGuide")}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-3 lg:grid lg:grid-cols-4 lg:justify-start lg:gap-3">
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
                                  ? "text-sm text-gray-300 line-through lg:rounded-lg lg:border lg:border-gray-200 lg:px-3 lg:py-2 lg:font-bold"
                                  : selected
                                    ? "text-sm font-semibold text-gray-900 underline underline-offset-4 lg:rounded-lg lg:border-2 lg:border-brand-600 lg:bg-brand-50 lg:px-3 lg:py-2 lg:font-bold lg:text-brand-600 lg:no-underline"
                                    : "text-sm text-gray-400 transition-colors hover:text-gray-700 lg:rounded-lg lg:border lg:border-gray-200 lg:px-3 lg:py-2 lg:font-bold lg:text-gray-700 lg:hover:border-brand-500 lg:hover:bg-brand-50"
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
                  <div key={key} className="py-3.5 lg:py-0">
                    <label
                      htmlFor={`variant-${key}`}
                      className="mb-2 block text-sm text-gray-900 lg:mb-4 lg:text-sm lg:font-bold lg:uppercase lg:tracking-wider"
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

              {inStock ? (
                <div className="flex items-center justify-between gap-4 py-3.5 lg:hidden">
                  <span className="text-sm text-gray-900">{t("storefront.quantity")}</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-40"
                      aria-label={t("productDetail.decreaseQty")}
                    >
                      <Minus size={16} weight="bold" aria-hidden />
                    </button>
                    <span className="min-w-[1.25rem] text-center text-sm font-medium tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={quantity >= maxQty}
                      className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-40"
                      aria-label={t("productDetail.increaseQty")}
                    >
                      <Plus size={16} weight="bold" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-4 lg:border-t lg:border-gray-100 lg:pt-3">
              {!inStock ? (
                <div className="py-3 text-center text-sm font-medium text-gray-600 lg:rounded-xl lg:border lg:border-gray-200 lg:bg-gray-100 lg:px-4 lg:font-bold">
                  {t("productDetail.soldOut")}
                </div>
              ) : (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="hidden h-11 w-[120px] items-center rounded-xl border border-gray-200 bg-gray-50 p-1 lg:flex">
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
                    className="flex w-full items-center justify-center gap-2 bg-brand-600 px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60 lg:flex-1 lg:rounded-xl lg:py-3 lg:font-bold lg:shadow-lg lg:shadow-brand-500/30"
                  >
                    <ShoppingCart size={18} weight="bold" className="lg:hidden" aria-hidden />
                    <span>{t("storefront.addToOrder")}</span>
                    <Plus size={16} weight="bold" className="lg:hidden" aria-hidden />
                  </button>
                </div>
              )}
              {inStock && maxQty > 0 ? (
                <p className="mt-2 text-center text-[11px] text-gray-500 lg:mt-2 lg:text-left lg:text-xs">
                  {t("productDetail.unitsAvailable", { count: maxQty })}
                </p>
              ) : null}
            </div>

            <section className="mt-8 border-t border-gray-200 pt-6 lg:mt-6 lg:border-t-0 lg:pt-0">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900 lg:hidden">
                {t("productDetail.descriptionTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 lg:hidden">{description}</p>
            </section>
          </div>
        </div>
      </main>

      <SizeGuideDialog
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        selectedSizeKey={selectedSizeKey}
      />
      <StorefrontFooter />
      <CartDrawer />
    </div>
  );
}
