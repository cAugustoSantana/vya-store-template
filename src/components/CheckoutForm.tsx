import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import shared from "@/styles/shared.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  name: string;
  phone: string;
  email: string;
  honeypot: string;
};

type Props = {
  onSubmit: (values: Omit<FormValues, "honeypot">) => Promise<void>;
  disabled?: boolean;
};

export function CheckoutForm({ onSubmit, disabled }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      });
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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      <div className={shared.field}>
        <label htmlFor="checkout-name">{t("checkout.name")}</label>
        <input
          id="checkout-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        {errors.name && <p className={shared.error}>{errors.name}</p>}
      </div>

      <div className={shared.field}>
        <label htmlFor="checkout-phone">{t("checkout.phone")}</label>
        <input
          id="checkout-phone"
          type="tel"
          autoComplete="tel"
          placeholder={t("checkout.phonePlaceholder")}
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
        <span className={shared.fieldHint}>{t("checkout.phoneHint")}</span>
        {errors.phone && <p className={shared.error}>{errors.phone}</p>}
      </div>

      <div className={shared.field}>
        <label htmlFor="checkout-email">{t("checkout.email")}</label>
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {errors.email && <p className={shared.error}>{errors.email}</p>}
      </div>

      <div className={shared.honeypot} aria-hidden="true">
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

      {submitError && <p className={shared.error}>{submitError}</p>}

      <button
        type="submit"
        className={shared.button}
        disabled={disabled || submitting}
      >
        {t("checkout.submit")}
      </button>
    </form>
  );
}
