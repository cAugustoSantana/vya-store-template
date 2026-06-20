import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bank,
  Check,
  Info,
  Package,
  Printer,
  TShirt,
} from "@phosphor-icons/react";
import { fetchPublicOrder } from "@/lib/api";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { ProofUpload } from "@/components/ProofUpload";
import { WhatsAppProofButton } from "@/components/WhatsAppProofButton";
import { OrderDeliveryTimeline } from "@/components/OrderDeliveryTimeline";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { formatMoney } from "@/lib/format";
import type { PublicOrder } from "@/types/commerce";
import type { Locale } from "@shared/types";

function formatVariantSummary(
  variants: Record<string, string>,
  quantity: number,
  quantityLabel: string,
): string {
  const parts = Object.entries(variants).map(([key, value]) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const val = value.charAt(0).toUpperCase() + value.slice(1);
    return `${label}: ${val}`;
  });
  parts.push(`${quantityLabel}: ${quantity}`);
  return parts.join(" • ");
}

function formatConfirmedDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 font-sans text-gray-900">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50/50 font-sans text-gray-900">
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
  const confirmedDate = formatConfirmedDate(order.createdAt, locale);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <main className="mx-auto w-full max-w-[1000px] flex-grow px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check size={24} weight="bold" aria-hidden />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                {t("payment.confirmedTitle")}
              </h1>
            </div>
            <p className="text-base text-gray-500 lg:text-lg">
              {t("payment.confirmedOn", {
                displayId: order.displayId,
                date: confirmedDate,
              })}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 print:hidden"
          >
            <ArrowLeft size={18} weight="bold" aria-hidden />
            {t("payment.returnToShop")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <OrderDeliveryTimeline order={order} locale={locale} />

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6 lg:p-8">
                <h2 className="text-lg font-bold text-gray-900">{t("payment.orderSummary")}</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => {
                  const Icon = index % 2 === 0 ? TShirt : Package;
                  const shortName = item.productName.slice(0, 8).toUpperCase();

                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center gap-6 p-6 lg:p-8"
                    >
                      <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                        <Icon
                          size={40}
                          weight="fill"
                          className="absolute text-brand-500/20"
                          aria-hidden
                        />
                        <span className="relative z-10 text-[10px] font-bold uppercase tracking-tighter text-brand-600">
                          {shortName}
                        </span>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                        <p className="text-sm text-gray-500">
                          {formatVariantSummary(
                            item.variants,
                            item.quantity,
                            t("storefront.quantity"),
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-gray-900">
                          {formatMoney(item.lineTotal, locale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 bg-gray-50/50 p-6 lg:p-8">
                <div className="flex justify-between font-medium text-gray-600">
                  <span>{t("payment.subtotal")}</span>
                  <span>{formatMoney(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-600">
                  <span>{t("payment.shipping")}</span>
                  <span className="font-semibold text-green-600">
                    {t("payment.shippingFree")}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-xl font-extrabold text-gray-900">
                  <span>{t("payment.totalAmount")}</span>
                  <span>{formatMoney(order.total, locale)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
              <h2 className="mb-6 text-lg font-bold text-gray-900">{t("payment.shippingInfo")}</h2>

              <div className="space-y-6">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("payment.contactEmail")}
                  </p>
                  <p className="font-medium text-gray-900">{order.buyerEmail}</p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("payment.shippingAddress")}
                  </p>
                  <div className="font-medium leading-relaxed text-gray-900">
                    {order.buyerName}
                    <br />
                    {order.shipping.address}
                    <br />
                    {order.shipping.city}, {order.shipping.postalCode}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("payment.deliveryMethod")}
                  </p>
                  <p className="font-medium text-gray-900">{t("payment.deliveryMethodValue")}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8 print:hidden">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Bank size={20} weight="bold" className="text-blue-600" aria-hidden />
                {t("payment.bankDetails")}
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-500">{t("payment.bankName")}</dt>
                  <dd className="font-semibold text-gray-900">{bt.bankName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-500">{t("payment.accountName")}</dt>
                  <dd className="truncate font-semibold text-gray-900">{bt.accountName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-500">{t("payment.accountNumber")}</dt>
                  <dd className="font-semibold text-gray-900">{bt.accountNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-500">{t("payment.accountType")}</dt>
                  <dd className="font-semibold text-gray-900">{bt.accountType}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-500">{t("payment.reference")}</dt>
                  <dd className="text-right font-semibold text-gray-900">{bt.referenceHint}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
                  <dt className="font-medium text-gray-500">{t("payment.total")}</dt>
                  <dd className="font-bold text-brand-600">{totalFormatted}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-gray-400">{t("payment.leaveHint")}</p>
            </section>

            {proofSubmitted ? (
              <div
                className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-center text-sm font-semibold text-green-800 print:hidden"
                role="status"
              >
                {order.paymentProofMethod === "whatsapp"
                  ? t("admin.proofWhatsApp")
                  : t("payment.proofUploaded")}
              </div>
            ) : (
              <section
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:hidden"
                aria-labelledby="proof-heading"
              >
                <div className="border-b border-gray-100 bg-gray-50/30 p-6">
                  <h2 id="proof-heading" className="text-lg font-bold text-gray-900">
                    {t("payment.uploadProof")}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{t("payment.nextStepHint")}</p>
                </div>
                <div className="space-y-4 p-6">
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
                    buttonClassName="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  />
                </div>
              </section>
            )}

            <div className="flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-6 print:hidden">
              <Info size={20} weight="bold" className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
              <p className="text-sm font-medium leading-relaxed text-brand-900/80">
                {t("payment.infoCallout")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 print:hidden"
            >
              <Printer size={18} weight="bold" aria-hidden />
              {t("payment.printReceipt")}
            </button>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
