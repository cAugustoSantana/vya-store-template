import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/context/ProductsContext";
import { useState, type FormEvent } from "react";
import type { Locale } from "@shared/types";
import { useCart } from "@/context/CartContext";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { postCheckout } from "@/lib/api";
import { getLocalized } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import type { CheckoutResponse } from "@/types/commerce";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  honeypot: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatVariants(variants: Record<string, string>): string {
  const parts = Object.entries(variants).map(([k, v]) => `${k}: ${v}`);
  return parts.join(" • ");
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const navigate = useNavigate();
  const { lines, total, clearCart } = useCart();
  const { getProduct } = useProducts();
  const { setActiveOrder } = useActiveOrder();

  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (!values.name.trim()) next.name = t("validation.required");
    if (!values.phone.trim()) next.phone = t("validation.required");
    else if (values.phone.replace(/\D/g, "").length < 10) {
      next.phone = t("validation.phoneInvalid");
    }
    if (!values.email.trim()) next.email = t("validation.required");
    else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = t("validation.emailInvalid");
    }
    if (!values.address.trim()) next.address = t("validation.required");
    if (!values.city.trim()) next.city = t("validation.required");
    if (!values.postalCode.trim()) next.postalCode = t("validation.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body = {
        locale,
        buyer: {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
        },
        shipping: {
          address: values.address.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
        },
        honeypot: values.honeypot,
        items: lines.map((line) => ({
          productId: line.productId,
          variants: line.variants,
          quantity: line.quantity,
        })),
      };

      const result = (await postCheckout(body)) as CheckoutResponse;
      setActiveOrder(result.displayId);
      clearCart();
      navigate(`/order/payment/${result.displayId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      if (message === "rate_limit") {
        setSubmitError(t("errors.rateLimit"));
      } else {
        setSubmitError(t("common.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
        <StorefrontHeader showCatalogNav />

        <main className="mx-auto flex flex-1 flex-col justify-center px-4 py-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t("checkout.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-500 lg:text-base">
            {t("validation.cartEmpty")}
          </p>
          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              {t("common.continueShopping")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader showCatalogNav />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-4 py-3 lg:overflow-hidden lg:px-8 lg:py-3">
        <div className="mb-3 shrink-0 lg:mb-2">
          <Link
            to="/"
            className="mb-1.5 inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline lg:mb-1"
          >
            <span aria-hidden>←</span>
            {t("common.continueShopping")}
          </Link>
          <h2 className="mb-0.5 text-xl font-extrabold tracking-tight text-gray-900 lg:text-2xl">
            {t("checkout.title")}
          </h2>
          <p className="text-xs text-gray-500 lg:text-sm">{t("checkout.subtitle")}</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
              <h3 className="mb-4 flex items-center gap-3 text-lg font-bold text-gray-900 lg:mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs text-brand-600">
                  1
                </span>
                {t("checkout.subtitle")}
              </h3>

              <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-x-4 lg:gap-y-3 lg:space-y-0">
                <div className="space-y-1 lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-name">
                    {t("checkout.name")}
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="name"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  />
                  {errors.name && <p className="text-sm font-medium text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-1 lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-phone">
                    {t("checkout.phone")}
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={t("checkout.phonePlaceholder")}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                  />
                  <p className="text-xs font-medium text-gray-500 lg:hidden">{t("checkout.phoneHint")}</p>
                  {errors.phone && <p className="text-sm font-medium text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-email">
                    {t("checkout.email")}
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  />
                  {errors.email && <p className="text-sm font-medium text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-address">
                    {t("checkout.address")}
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                    value={values.address}
                    onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
                  />
                  {errors.address && <p className="text-sm font-medium text-red-600">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2 lg:gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-city">
                      {t("checkout.city")}
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                      value={values.city}
                      onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
                    />
                    {errors.city && <p className="text-sm font-medium text-red-600">{errors.city}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="checkout-postal">
                      {t("checkout.postalCode")}
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                      value={values.postalCode}
                      onChange={(e) => setValues((v) => ({ ...v, postalCode: e.target.value }))}
                    />
                    {errors.postalCode && <p className="text-sm font-medium text-red-600">{errors.postalCode}</p>}
                  </div>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="checkout-website">Website</label>
                  <input
                    id="checkout-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.honeypot}
                    onChange={(e) => setValues((v) => ({ ...v, honeypot: e.target.value }))}
                  />
                </div>

                {submitError && (
                  <p className="text-sm font-medium text-red-600 lg:col-span-2">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 lg:col-span-2"
                >
                  {t("checkout.submit")}
                </button>
              </form>
            </section>
          </div>

          <div className="lg:col-span-5 lg:min-h-0">
            <div className="flex max-h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-14 lg:max-h-[calc(100dvh-3.75rem)] lg:overflow-y-auto lg:p-6">
              <h3 className="mb-4 flex shrink-0 items-center justify-between border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                {t("checkout.orderSummary")}
                <span className="text-sm font-medium text-gray-500">
                  {lines.length} {lines.length === 1 ? "item" : "items"}
                </span>
              </h3>

              <div className="mb-4 space-y-4">
                {lines.map((line) => {
                  const product = getProduct(line.productId);
                  const name = product ? getLocalized(product.name, locale) : line.productId;
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
                        {variants && (
                          <p className="mt-0.5 text-sm text-gray-500">{variants}</p>
                        )}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
