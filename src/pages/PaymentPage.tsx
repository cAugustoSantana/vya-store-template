import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bank, Check, Package, TShirt } from "@phosphor-icons/react";
import { fetchPublicOrder } from "@/lib/api";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { ProofUpload } from "@/components/ProofUpload";
import { WhatsAppProofButton } from "@/components/WhatsAppProofButton";
import { CollapsibleCard } from "@/components/CollapsibleCard";
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
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50/50 font-sans text-gray-900">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-[100dvh] flex-col bg-gray-50/50 font-sans text-gray-900">
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-6 lg:max-w-xl lg:py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check size={28} weight="bold" aria-hidden />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {t("payment.confirmedTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("payment.confirmedOn", {
              displayId: order.displayId,
              date: confirmedDate,
            })}
          </p>
        </div>

        {proofSubmitted ? (
          <div
            className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm font-semibold text-green-800"
            role="status"
          >
            {order.paymentProofMethod === "whatsapp"
              ? t("admin.proofWhatsApp")
              : t("payment.proofUploaded")}
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center">
            <p className="text-sm font-bold text-brand-800">{t("payment.nextStep")}</p>
            <p className="mt-1 text-sm text-brand-700">{t("payment.nextStepHint")}</p>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bank size={20} weight="bold" className="text-brand-600" aria-hidden />
            <h2 className="text-base font-bold text-gray-900">{t("payment.bankDetails")}</h2>
          </div>
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
        </div>

        {!proofSubmitted && (
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">{t("payment.uploadProof")}</h2>
            <div className="space-y-4">
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
          </div>
        )}

        <CollapsibleCard title={t("payment.orderSummary")} defaultOpen={false}>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
            {order.items.map((item, index) => {
              const Icon = index % 2 === 0 ? TShirt : Package;
              const shortName = item.productName.slice(0, 8).toUpperCase();

              return (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                    <Icon
                      size={28}
                      weight="fill"
                      className="absolute text-brand-500/20"
                      aria-hidden
                    />
                    <span className="relative z-10 text-[9px] font-bold uppercase tracking-tighter text-brand-600">
                      {shortName}
                    </span>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h3 className="font-bold text-gray-900">{item.productName}</h3>
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

          <div className="mt-4 space-y-2 rounded-xl bg-gray-50/80 p-4">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>{t("payment.subtotal")}</span>
              <span>{formatMoney(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>{t("payment.shipping")}</span>
              <span className="font-semibold text-green-600">{t("payment.shippingFree")}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-extrabold text-gray-900">
              <span>{t("payment.totalAmount")}</span>
              <span>{formatMoney(order.total, locale)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("payment.shippingAddress")}
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {order.buyerName}
                <br />
                {order.shipping.address}
                <br />
                {order.shipping.city}, {order.shipping.postalCode}
              </p>
            </div>
          </div>
        </CollapsibleCard>

        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700"
        >
          <ArrowLeft size={16} weight="bold" aria-hidden />
          {t("payment.returnToShop")}
        </Link>
      </main>

      <StorefrontFooter />
    </div>
  );
}
