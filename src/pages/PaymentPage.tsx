import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bank,
  Check,
  MapPin,
  Package,
  Printer,
  TShirt,
} from "@phosphor-icons/react";
import { fetchPublicOrder } from "@/lib/api";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { ProofUpload } from "@/components/ProofUpload";
import { WhatsAppProofButton } from "@/components/WhatsAppProofButton";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { formatMoney } from "@/lib/format";
import type { PublicOrder } from "@/types/commerce";
import type { Locale } from "@shared/types";

const ITEM_TILES = [
  "bg-brand-50 border-brand-100 text-brand-500/40",
  "bg-amber-50 border-amber-100 text-amber-500/40",
  "bg-emerald-50 border-emerald-100 text-emerald-500/40",
] as const;

function formatVariantLabel(key: string, value: string): string {
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  const val = value.charAt(0).toUpperCase() + value.slice(1);
  return `${label}: ${val}`;
}

function variantDotClass(key: string, value: string): string {
  if (key === "color") {
    const v = value.toLowerCase();
    if (v.includes("black")) return "bg-black";
    if (v.includes("navy") || v.includes("blue")) return "bg-blue-900";
    if (v.includes("white")) return "bg-white border border-gray-300";
  }
  return "bg-gray-300";
}

export function PaymentPage() {
  const { displayId } = useParams<{ displayId: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { setActiveOrder } = useActiveOrder();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!displayId) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchPublicOrder(displayId)) as PublicOrder;
      setOrder(data);
      setActiveOrder(displayId);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [displayId, setActiveOrder, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50/50 font-sans text-gray-900">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-[100dvh] flex-col bg-gray-50/50 font-sans text-gray-900">
        <StorefrontHeader />
        <main className="mx-auto flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="font-medium text-red-600">{error ?? t("common.error")}</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-10 py-4 font-bold text-white hover:bg-brand-700"
          >
            {t("common.continueShopping")}
          </Link>
        </main>
      </div>
    );
  }

  const bt = order.payment.bankTransfer;
  const totalFormatted = formatMoney(order.total, locale);
  const subtotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const proofSubmitted =
    order.hasProof || order.paymentProofMethod === "whatsapp";
  const canUpload =
    order.estado === "payment_confirmation_pending" && !proofSubmitted;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-6 py-4 lg:overflow-hidden lg:px-10 lg:py-4">
        <div className="mb-4 shrink-0 text-center lg:mb-3 lg:flex lg:items-center lg:gap-4 lg:text-left">
          <div className="mx-auto mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-600 shadow-sm lg:mx-0 lg:mb-0 lg:h-12 lg:w-12">
            <Check size={28} weight="bold" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
              {t("payment.confirmedTitle")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 lg:text-base">
              {t("payment.confirmedSubtitle")}
            </p>
          </div>
          <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 lg:mt-0 lg:shrink-0">
            {t("payment.orderNumber", { displayId: order.displayId }).toUpperCase()}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:max-h-full">
            <div className="shrink-0 border-b border-gray-100 bg-gray-50/30 px-4 py-3 lg:px-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <Package size={18} weight="fill" className="text-brand-600" aria-hidden />
                {t("payment.orderSummary")}
              </h2>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
              {order.items.map((item, index) => {
                const tile = ITEM_TILES[index % ITEM_TILES.length];
                const Icon = index % 2 === 0 ? TShirt : Package;
                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center gap-3 px-4 py-3 lg:px-5"
                  >
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border ${tile}`}
                    >
                      <Icon size={28} weight="fill" className="opacity-40" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h3 className="truncate text-sm font-bold text-gray-900">{item.productName}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        {Object.entries(item.variants).map(([key, value]) => (
                          <span
                            key={key}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${variantDotClass(key, value)}`}
                              aria-hidden
                            />
                            {formatVariantLabel(key, value)}
                          </span>
                        ))}
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" aria-hidden />
                          {t("storefront.quantity")}: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatMoney(item.lineTotal, locale)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-4 py-3 lg:px-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">{t("payment.subtotal")}</span>
                  <span>{formatMoney(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">{t("payment.shipping")}</span>
                  <span className="font-semibold text-green-600">
                    {t("payment.shippingFree")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <span className="font-bold text-gray-900">{t("payment.totalAmount")}</span>
                  <span className="text-xl font-black tracking-tight text-gray-900">
                    {formatMoney(order.total, locale)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3 lg:max-h-full lg:overflow-y-auto lg:pr-1">
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <MapPin size={20} weight="bold" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-0.5 text-sm font-bold text-gray-900">
                    {t("payment.shippingAddress")}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-gray-500">
                    {order.shipping.address}
                    <br />
                    {order.shipping.city}, {order.shipping.postalCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Bank size={20} weight="bold" aria-hidden />
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="mb-0.5 text-sm font-bold text-gray-900">{t("payment.bankDetails")}</h3>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-gray-500">{t("payment.bankName")}</dt>
                      <dd className="font-semibold text-gray-900">{bt.bankName}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-gray-500">{t("payment.accountName")}</dt>
                      <dd className="truncate font-semibold text-gray-900">{bt.accountName}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-gray-500">{t("payment.accountNumber")}</dt>
                      <dd className="font-semibold text-gray-900">{bt.accountNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-gray-500">{t("payment.accountType")}</dt>
                      <dd className="font-semibold text-gray-900">{bt.accountType}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-gray-500">{t("payment.reference")}</dt>
                      <dd className="text-right font-semibold text-gray-900">{bt.referenceHint}</dd>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-gray-100 pt-1">
                      <dt className="font-medium text-gray-500">{t("payment.total")}</dt>
                      <dd className="font-bold text-brand-600">{totalFormatted}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-[10px] text-gray-400">{t("payment.leaveHint")}</p>
                </div>
              </div>
            </div>

            {proofSubmitted ? (
              <div
                className="shrink-0 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-xs font-semibold text-green-800"
                role="status"
              >
                {order.paymentProofMethod === "whatsapp"
                  ? t("admin.proofWhatsApp")
                  : t("payment.proofUploaded")}
              </div>
            ) : (
              <section
                className="shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:hidden"
                aria-labelledby="proof-heading"
              >
                <div className="border-b border-gray-100 bg-gray-50/30 px-4 py-3">
                  <h2 id="proof-heading" className="text-sm font-bold text-gray-900">
                    {t("payment.uploadProof")}
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">{t("payment.nextStepHint")}</p>
                </div>
                <div className="space-y-3 p-4">
                  <ProofUpload
                    displayId={order.displayId}
                    disabled={!canUpload}
                    onUploaded={() => void load()}
                  />
                  <WhatsAppProofButton
                    displayId={order.displayId}
                    buyerName={order.buyerName}
                    totalFormatted={totalFormatted}
                    locale={order.locale as "es" | "en"}
                    disabled={!canUpload}
                    onSent={() => void load()}
                    buttonClassName="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 sm:w-auto"
                  />
                </div>
              </section>
            )}

            <div className="flex shrink-0 flex-col gap-2 print:hidden sm:flex-row lg:mt-auto">
              <Link
                to="/"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-[0.98] sm:flex-none"
              >
                {t("common.continueShopping")}
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 sm:flex-none"
              >
                <Printer size={16} weight="bold" aria-hidden />
                {t("payment.printReceipt")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
