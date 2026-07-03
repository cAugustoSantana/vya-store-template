import { useId, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/types/commerce";
import type { Product } from "@shared/product.types";
import type { Locale } from "@shared/types";

type Props = {
  lines: CartLine[];
  total: number;
  locale: Locale;
  getProduct: (id: string) => Product | undefined;
};

function formatVariants(variants: Record<string, string>): string {
  const parts = Object.entries(variants).map(([k, v]) => `${k}: ${v}`);
  return parts.join(" • ");
}

function OrderSummaryContent({
  lines,
  total,
  locale,
  getProduct,
}: Omit<Props, never>) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-4 space-y-4">
        {lines.map((line) => {
          const product = getProduct(line.productId);
          const name = product ? product.name : line.productId;
          const unitPrice = product?.price ?? 0;
          const lineTotal = unitPrice * line.quantity;
          const variants = formatVariants(line.variants);

          return (
            <div key={line.lineId} className="flex gap-4">
              <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-[10px] font-bold text-brand-600">
                  {name.slice(0, 10)}
                </span>
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-gray-900">{name}</h4>
                  <span className="font-bold text-gray-900">
                    {formatMoney(unitPrice, locale)}
                  </span>
                </div>
                {variants && <p className="mt-0.5 text-sm text-gray-500">{variants}</p>}
                <p className="mt-1 text-sm font-semibold text-brand-600">
                  Qty: {line.quantity}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-400">
                  Line: {formatMoney(lineTotal, locale)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 space-y-3 border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-500">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">{formatMoney(total, locale)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span className="font-medium">Shipping</span>
          <span className="font-semibold text-green-600">Free</span>
        </div>
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base lg:text-lg">
          <span className="font-bold text-gray-900">{t("cart.total")}</span>
          <span className="text-2xl font-black tracking-tight text-gray-900 lg:text-3xl">
            {formatMoney(total, locale)}
          </span>
        </div>
      </div>
    </>
  );
}

export function CheckoutOrderSummaryMobile({ lines, total, locale, getProduct }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const firstLine = lines[0];
  const firstProduct = firstLine ? getProduct(firstLine.productId) : undefined;
  const firstName = firstProduct ? firstProduct.name : firstLine?.productId ?? "";
  const itemLabel = lines.length === 1 ? "item" : "items";
  const firstVariants = firstLine ? formatVariants(firstLine.variants) : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:hidden">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50/80"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {firstLine ? (
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <span className="text-[9px] font-bold text-brand-600">
              {firstName.slice(0, 8).toUpperCase()}
            </span>
          </div>
        ) : null}

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-gray-900">
                {firstName}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {lines.length} {itemLabel}
                {firstVariants ? ` • ${firstVariants}` : ""}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold tabular-nums text-gray-700">
                {formatMoney(total, locale)}
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </span>
          </span>
          <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t("checkout.orderSummary")}
          </span>
        </span>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-gray-100 px-4 pb-4">
          <OrderSummaryContent
            lines={lines}
            total={total}
            locale={locale}
            getProduct={getProduct}
          />
        </div>
      ) : null}
    </section>
  );
}

export function CheckoutOrderSummaryDesktop({ lines, total, locale, getProduct }: Props) {
  const { t } = useTranslation();

  return (
    <div className="hidden max-h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex lg:sticky lg:top-14 lg:max-h-[calc(100dvh-3.75rem)] lg:overflow-y-auto lg:p-6">
      <h3 className="mb-4 flex shrink-0 items-center justify-between border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
        {t("checkout.orderSummary")}
        <span className="text-sm font-medium text-gray-500">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </span>
      </h3>

      <OrderSummaryContent
        lines={lines}
        total={total}
        locale={locale}
        getProduct={getProduct}
      />
    </div>
  );
}
