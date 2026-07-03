import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/context/ProductsContext";
import { useState, type FormEvent } from "react";
import type { Locale } from "@shared/types";
import { useCart } from "@/context/CartContext";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { postCheckout } from "@/lib/api";
import {
  CheckoutOrderSummaryDesktop,
  CheckoutOrderSummaryMobile,
} from "@/components/CheckoutOrderSummary";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
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
      } else if (message === "insufficient_stock") {
        setSubmitError(t("errors.insufficientStock"));
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
        <StorefrontHeader />

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
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-900">
      <StorefrontHeader />

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

        <CheckoutOrderSummaryMobile
          lines={lines}
          total={total}
          locale={locale}
          getProduct={getProduct}
        />

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
            <CheckoutOrderSummaryDesktop
              lines={lines}
              total={total}
              locale={locale}
              getProduct={getProduct}
            />
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
