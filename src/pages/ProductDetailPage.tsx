import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowsCounterClockwise,
  Check,
  MagnifyingGlassPlus,
  Minus,
  Plus,
  SelectionBackground,
  ShoppingCart,
  Star,
  TShirt,
  Truck,
  VideoCamera,
} from "@phosphor-icons/react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";
import { SizeGuideDialog } from "@/components/SizeGuideDialog";
import { getLocalized } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
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
  const { addLine, isDrawerOpen } = useCart();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const product = productId ? getProduct(productId) : undefined;
  const variantKeys = useMemo(
    () => (product ? Object.keys(product.variantOptions) : []),
    [product],
  );

  const [variants, setVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    if (!product) return;
    setVariants(defaultVariants(product.variantOptions));
    setQuantity(1);
    setActiveThumb(0);
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 font-sans">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50/50 font-sans text-gray-900">
        <StorefrontHeader showAdminNav />
        <main className="mx-auto w-full max-w-[1440px] flex-grow px-6 py-16 text-center lg:px-10">
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

  const name = getLocalized(product.name, locale);
  const description = getLocalized(product.description, locale);
  const nameShort = name.slice(0, 8).toUpperCase();

  const handleAdd = () => {
    if (!allSelected || quantity < 1) return;
    addLine({
      productId: product.id,
      variants: { ...resolvedVariants },
      quantity,
    });
  };

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => Math.min(99, q + 1));

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader showAdminNav />

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-6 py-4 lg:overflow-hidden lg:px-10 lg:py-4 ${
          isDrawerOpen ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <div className="mb-3 shrink-0 lg:mb-2">
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

        <div className="grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-8 xl:gap-10">
          <div className="flex flex-col gap-3 lg:col-span-7 lg:min-h-0 lg:max-h-full">
            <div className="relative flex aspect-square min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:aspect-auto lg:max-h-[calc(100dvh-9rem)] lg:p-6">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
                <TShirt size={320} weight="fill" className="text-brand-600 lg:hidden" aria-hidden />
                <TShirt size={240} weight="fill" className="hidden text-brand-600 lg:block" aria-hidden />
              </div>
              {activeThumb === 0 ? (
                <img
                  src={product.imageUrl}
                  alt={name}
                  className="relative z-10 max-h-full max-w-full object-contain"
                />
              ) : (
                <>
                  <span className="relative z-10 text-4xl font-bold tracking-widest text-brand-600 opacity-20">
                    {nameShort}
                  </span>
                  <TShirt
                    size={240}
                    weight="fill"
                    className="relative z-10 text-brand-600/20"
                    aria-hidden
                  />
                </>
              )}
            </div>

            <div className="grid shrink-0 grid-cols-4 gap-2 lg:gap-3">
              {[0, 1, 2, 3].map((index) => {
                const active = activeThumb === index;
                const icons = [
                  { Icon: TShirt, weight: "fill" as const },
                  { Icon: SelectionBackground, weight: "regular" as const },
                  { Icon: MagnifyingGlassPlus, weight: "regular" as const },
                  { Icon: VideoCamera, weight: "regular" as const },
                ];
                const { Icon, weight } = icons[index];
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveThumb(index)}
                    className={
                      active
                        ? "flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-brand-500 bg-white p-2 lg:p-3"
                        : "flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-2 transition-colors hover:border-brand-200 lg:p-3"
                    }
                    aria-label={t("productDetail.thumbnail", { index: index + 1 })}
                    aria-pressed={active}
                  >
                    {index === 0 ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Icon
                        size={32}
                        weight={weight}
                        className={active ? "text-brand-600" : "text-gray-300"}
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-5 lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:space-y-4">
            <div>
              <div className="mb-3 flex items-center gap-2 lg:mb-2">
                <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 lg:hidden">
                  {t("productDetail.newArrival")}
                </span>
                <div className="ml-auto flex items-center gap-1 text-amber-500 lg:hidden">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16} weight="fill" aria-hidden />
                  ))}
                  <Star size={16} weight="bold" className="text-gray-300" aria-hidden />
                  <span className="ml-1 text-sm font-bold text-gray-500">(42)</span>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900 lg:text-4xl">
                {name}
              </h1>
              <div className="text-2xl font-extrabold text-brand-600 lg:text-3xl">
                {formatMoney(product.price, locale)}
              </div>
            </div>

            <div className="space-y-3 lg:space-y-2">
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 lg:line-clamp-3">{description}</p>
              <ul className="space-y-1.5 text-sm text-gray-500 lg:hidden">
                <li className="flex items-center gap-2">
                  <Check size={16} weight="bold" className="text-brand-500" aria-hidden />
                  {t("productDetail.feature1")}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} weight="bold" className="text-brand-500" aria-hidden />
                  {t("productDetail.feature2")}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} weight="bold" className="text-brand-500" aria-hidden />
                  {t("productDetail.feature3")}
                </li>
              </ul>
            </div>

            <div className="space-y-4 lg:space-y-3">
              {variantKeys.map((key) => {
                const group = product.variantOptions[key];
                const label = getLocalized(group.label, locale);

                if (isColorVariant(key)) {
                  return (
                    <div key={key}>
                      <div className="mb-3 flex items-center justify-between lg:mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                          {t("productDetail.selectColor")}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {selectedColorLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
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
                              className={`h-10 w-10 rounded-full transition-all ${colorSwatchClass(valueKey)} ${
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
                      <div className="mb-3 flex items-center justify-between lg:mb-2">
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
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(group.values).map(([valueKey, valueLabel]) => {
                          const selected = resolvedVariants[key] === valueKey;
                          const display = getLocalized(valueLabel, locale);
                          return (
                            <button
                              key={valueKey}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                setVariants((prev) => ({ ...prev, [key]: valueKey }))
                              }
                              className={
                                selected
                                  ? "rounded-lg border-2 border-brand-600 bg-brand-50 px-3 py-2.5 font-bold text-brand-600 transition-all lg:py-2"
                                  : "rounded-lg border border-gray-200 px-3 py-2.5 font-bold text-gray-700 transition-all hover:border-brand-500 hover:bg-brand-50 lg:py-2"
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
                      className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-900"
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

              <div className="space-y-3 border-t border-gray-100 pt-4 lg:pt-3">
                <div className="flex gap-3 lg:gap-4">
                  <div className="flex h-12 w-[120px] items-center rounded-xl border border-gray-200 bg-gray-50 p-1 lg:h-11">
                    <button
                      type="button"
                      onClick={decrementQty}
                      className="flex h-full w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
                      aria-label={t("productDetail.decreaseQty")}
                    >
                      <Minus size={16} weight="bold" aria-hidden />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(99, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-full flex-1 border-none bg-transparent p-0 text-center text-lg font-bold text-gray-900 focus:outline-none"
                      aria-label={t("storefront.quantity")}
                    />
                    <button
                      type="button"
                      onClick={incrementQty}
                      className="flex h-full w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
                      aria-label={t("productDetail.increaseQty")}
                    >
                      <Plus size={16} weight="bold" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={!allSelected}
                    onClick={handleAdd}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 lg:py-3"
                  >
                    <ShoppingCart size={20} weight="bold" aria-hidden />
                    {t("storefront.addToOrder")}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 py-1 lg:gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Truck size={18} weight="bold" className="text-gray-300" aria-hidden />
                    {t("productDetail.fastShipping")}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <ArrowsCounterClockwise
                      size={18}
                      weight="bold"
                      className="text-gray-300"
                      aria-hidden
                    />
                    {t("productDetail.returns")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SizeGuideDialog
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        selectedSizeKey={selectedSizeKey}
      />
      <CartDrawer />
    </div>
  );
}
