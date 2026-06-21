import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bag,
  BaseballCap,
  Minus,
  Plus,
  TShirt,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { cartLineTileClass, formatCartVariants } from "@/lib/cartDisplay";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import { formatMoney } from "@/lib/format";
import { getLocalized } from "@/lib/localized";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import type { Locale } from "@shared/types";

function lineIcon(productId: string) {
  if (productId.includes("cap") || productId.includes("gorra")) {
    return BaseballCap;
  }
  return TShirt;
}

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const {
    lines,
    removeLine,
    updateLineQuantity,
    total,
    taxAmount,
    grandTotal,
    isDrawerOpen,
    closeDrawer,
  } = useCart();
  const { getProduct } = useProducts();
  const settings = useStoreConfig();
  const taxPercent = Math.round(settings.taxRate * 100);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        aria-label={t("cart.close")}
        onClick={closeDrawer}
      />

      <aside
        className="animate-slide-in relative flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
        aria-label={t("cart.title")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Bag size={20} weight="fill" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("cart.title")}</h2>
              <p className="text-sm font-medium text-gray-500">
                {t("cart.itemsSelected", { count: lines.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100"
            aria-label={t("cart.close")}
          >
            <X size={20} weight="bold" aria-hidden />
          </button>
        </div>

        <div className="flex-grow space-y-6 overflow-y-auto px-6 py-6 lg:px-8">
          {lines.map((line, index) => {
            const product = getProduct(line.productId);
            const name = product
              ? getLocalized(product.name, locale)
              : line.productId;
            const unitPrice = product?.price ?? 0;
            const lineTotal = unitPrice * line.quantity;
            const tile = cartLineTileClass(index);
            const Icon = lineIcon(line.productId);

            return (
              <div key={line.lineId}>
                {index > 0 && <div className="mb-6 h-px bg-gray-100" />}
                <div className="group flex gap-4">
                  <div
                    className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border ${tile}`}
                  >
                    {product?.imageUrl ? (
                      <img
                        src={resolvePublicProductImageUrl(line.productId, product.imageUrl)}
                        alt=""
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    ) : (
                      <Icon size={32} weight="fill" aria-hidden />
                    )}
                  </div>
                  <div className="flex-grow py-1">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="text-lg font-bold leading-tight text-gray-900">
                        {name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeLine(line.lineId)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                        aria-label={t("cart.remove")}
                      >
                        <Trash size={18} aria-hidden />
                      </button>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">
                      {formatCartVariants(line.productId, line.variants, locale, getProduct)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateLineQuantity(line.lineId, line.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:text-gray-900"
                          aria-label={t("productDetail.decreaseQty")}
                        >
                          <Minus size={12} weight="bold" aria-hidden />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateLineQuantity(line.lineId, line.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:text-gray-900"
                          aria-label={t("productDetail.increaseQty")}
                        >
                          <Plus size={12} weight="bold" aria-hidden />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatMoney(lineTotal, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 border-t border-gray-200 bg-gray-50/50 p-6 lg:p-8">
          <div className="space-y-2.5">
            <div className="flex justify-between font-medium text-gray-500">
              <span>{t("cart.subtotal")}</span>
              <span>{formatMoney(total, locale)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-500">
              <span>{t("cart.tax", { percent: taxPercent })}</span>
              <span>{formatMoney(taxAmount, locale)}</span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">{t("cart.total")}</span>
              <span className="text-3xl font-black tracking-tight text-gray-900">
                {formatMoney(grandTotal, locale)}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            onClick={closeDrawer}
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 active:scale-[0.98]"
          >
            {t("cart.proceedCheckout")}
            <ArrowRight size={20} weight="bold" aria-hidden />
          </Link>
          <p className="text-center text-xs font-medium text-gray-400">
            {t("cart.shippingNote")}
          </p>
        </div>
      </aside>
    </div>
  );
}
