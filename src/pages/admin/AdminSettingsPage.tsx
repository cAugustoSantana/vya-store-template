import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, type FormEvent } from "react";
import { fetchAdminSettings, updateAdminSettings, uploadAdminStoreLogo } from "@/lib/api";
import { resolvePublicLogoUrl } from "@/lib/logoUrl";
import { AdminPageHeader, AdminSuccess } from "@/components/admin/AdminUi";
import type { StoreSettingsData } from "@shared/storeSettings.types";
import type { Locale } from "@shared/types";
import shared from "@/styles/shared.module.css";
import formStyles from "./AdminProductFormPage.module.css";

type AdminOutletContext = { token: string };

const LOCALES: Locale[] = ["es", "en"];

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result, mimeType: file.type });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function settingsToForm(settings: StoreSettingsData) {
  return {
    storeSlug: settings.storeSlug,
    storeNameEs: settings.storeName.es,
    storeNameEn: settings.storeName.en,
    descriptionEs: settings.description.es,
    descriptionEn: settings.description.en,
    defaultLocale: settings.defaultLocale,
    currency: settings.currency,
    taxRatePercent: String(Math.round(settings.taxRate * 1000) / 10),
    primaryColor: settings.primaryColor,
    logoUrl: settings.logoUrl,
    phoneCountryCode: settings.phone.defaultCountryCode,
    phoneLocalDigits: String(settings.phone.localDigits),
    emailFrom: settings.email.from,
    ownerEmail: settings.contact.ownerEmail,
    whatsappCountryCode: settings.contact.whatsappCountryCode,
    whatsappNumber: settings.contact.whatsappNumber,
    instagramUrl: settings.contact.instagramUrl,
    instructionsEs: settings.payment.bankTransfer.instructions.es,
    instructionsEn: settings.payment.bankTransfer.instructions.en,
    referenceHintEs: settings.payment.bankTransfer.referenceHint.es,
    referenceHintEn: settings.payment.bankTransfer.referenceHint.en,
  };
}

type FormState = ReturnType<typeof settingsToForm>;

function formToSettings(form: FormState): StoreSettingsData {
  const taxRate = Number(form.taxRatePercent) / 100;
  return {
    storeSlug: form.storeSlug.trim(),
    storeName: { es: form.storeNameEs.trim(), en: form.storeNameEn.trim() },
    description: { es: form.descriptionEs.trim(), en: form.descriptionEn.trim() },
    defaultLocale: form.defaultLocale as Locale,
    supportedLocales: LOCALES,
    currency: form.currency.trim(),
    taxRate: Number.isFinite(taxRate) ? taxRate : 0.18,
    primaryColor: form.primaryColor.trim(),
    logoUrl: form.logoUrl.trim(),
    phone: {
      defaultCountryCode: form.phoneCountryCode.trim(),
      localDigits: Number(form.phoneLocalDigits) || 10,
    },
    email: { from: form.emailFrom.trim() },
    contact: {
      whatsappCountryCode: form.whatsappCountryCode.trim(),
      whatsappNumber: form.whatsappNumber.trim(),
      instagramUrl: form.instagramUrl.trim(),
      ownerEmail: form.ownerEmail.trim(),
    },
    payment: {
      provider: "bank_transfer_proof",
      bankTransfer: {
        instructions: {
          es: form.instructionsEs.trim(),
          en: form.instructionsEn.trim(),
        },
        referenceHint: {
          es: form.referenceHintEs.trim(),
          en: form.referenceHintEn.trim(),
        },
      },
    },
    orderStatuses: [
      "payment_confirmation_pending",
      "confirmed",
      "in_production",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ],
    defaultOrderStatus: "payment_confirmation_pending",
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={shared.card}>
      <h2 style={{ margin: "0 0 1rem", fontSize: "1.125rem" }}>{title}</h2>
      {children}
    </section>
  );
}

export function AdminSettingsPage() {
  const { t } = useTranslation();
  const { token } = useOutletContext<AdminOutletContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminSettings(token);
        if (cancelled) return;
        setForm(settingsToForm(data.settings));
        setLogoPreview(data.settings.logoUrl);
        setLogoFile(null);
        setSavedAt(data.updatedAt);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      let result = await updateAdminSettings(token, formToSettings(form));

      if (logoFile) {
        const { base64, mimeType } = await fileToBase64(logoFile);
        result = await uploadAdminStoreLogo(token, base64, mimeType);
        setLogoFile(null);
      }

      setForm(settingsToForm(result.settings));
      setLogoPreview(result.settings.logoUrl);
      setSavedAt(result.updatedAt);
      setSaveSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <>
      <Link to="/admin/orders" className={formStyles.backLink}>
        {t("admin.backToOrders")}
      </Link>
      <AdminPageHeader
        title={t("admin.settings.title")}
        subtitle={t("admin.settings.subtitle")}
      />
      {saveSuccess && (
        <AdminSuccess
          message={t("admin.settings.saved")}
          onDismiss={() => setSaveSuccess(false)}
        />
      )}
      {savedAt && <p className={shared.fieldHint}>{t("admin.settings.lastSaved", { date: savedAt })}</p>}

      <form className={formStyles.form} onSubmit={(e) => void handleSubmit(e)}>
        <Section title={t("admin.settings.storeSection")}>
          <div className={shared.field}>
            <label htmlFor="settings-slug">{t("admin.settings.storeSlug")}</label>
            <input
              id="settings-slug"
              value={form.storeSlug}
              onChange={(e) => updateField("storeSlug", e.target.value)}
            />
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-name-es">{t("admin.products.nameEs")}</label>
              <input
                id="settings-name-es"
                value={form.storeNameEs}
                onChange={(e) => updateField("storeNameEs", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-name-en">{t("admin.products.nameEn")}</label>
              <input
                id="settings-name-en"
                value={form.storeNameEn}
                onChange={(e) => updateField("storeNameEn", e.target.value)}
              />
            </div>
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-desc-es">{t("admin.products.descEs")}</label>
              <textarea
                id="settings-desc-es"
                rows={2}
                value={form.descriptionEs}
                onChange={(e) => updateField("descriptionEs", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-desc-en">{t("admin.products.descEn")}</label>
              <textarea
                id="settings-desc-en"
                rows={2}
                value={form.descriptionEn}
                onChange={(e) => updateField("descriptionEn", e.target.value)}
              />
            </div>
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-locale">{t("admin.settings.defaultLocale")}</label>
              <select
                id="settings-locale"
                value={form.defaultLocale}
                onChange={(e) => updateField("defaultLocale", e.target.value as Locale)}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-currency">{t("admin.settings.currency")}</label>
              <input
                id="settings-currency"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </div>
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-tax">{t("admin.settings.taxRate")}</label>
              <input
                id="settings-tax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.taxRatePercent}
                onChange={(e) => updateField("taxRatePercent", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-color">{t("admin.settings.primaryColor")}</label>
              <input
                id="settings-color"
                value={form.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
              />
            </div>
          </div>
          <div className={shared.field}>
            <label htmlFor="settings-logo">{t("admin.settings.logo")}</label>
            <input
              id="settings-logo"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setLogoFile(file);
                setLogoPreview(file ? URL.createObjectURL(file) : form.logoUrl);
              }}
            />
            {logoPreview && (
              <img
                src={resolvePublicLogoUrl(logoPreview)}
                alt=""
                className={formStyles.preview}
              />
            )}
          </div>
        </Section>

        <Section title={t("admin.settings.contactSection")}>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-phone-cc">{t("admin.settings.phoneCountryCode")}</label>
              <input
                id="settings-phone-cc"
                value={form.phoneCountryCode}
                onChange={(e) => updateField("phoneCountryCode", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-phone-digits">{t("admin.settings.phoneLocalDigits")}</label>
              <input
                id="settings-phone-digits"
                type="number"
                value={form.phoneLocalDigits}
                onChange={(e) => updateField("phoneLocalDigits", e.target.value)}
              />
            </div>
          </div>
          <div className={shared.field}>
            <label htmlFor="settings-email-from">{t("admin.settings.emailFrom")}</label>
            <input
              id="settings-email-from"
              value={form.emailFrom}
              onChange={(e) => updateField("emailFrom", e.target.value)}
            />
          </div>
          <div className={shared.field}>
            <label htmlFor="settings-owner-email">{t("admin.settings.ownerEmail")}</label>
            <input
              id="settings-owner-email"
              value={form.ownerEmail}
              onChange={(e) => updateField("ownerEmail", e.target.value)}
            />
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-wa-cc">{t("admin.settings.whatsappCountryCode")}</label>
              <input
                id="settings-wa-cc"
                value={form.whatsappCountryCode}
                onChange={(e) => updateField("whatsappCountryCode", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-wa-number">{t("admin.settings.whatsappNumber")}</label>
              <input
                id="settings-wa-number"
                value={form.whatsappNumber}
                onChange={(e) => updateField("whatsappNumber", e.target.value)}
              />
            </div>
          </div>
          <div className={shared.field}>
            <label htmlFor="settings-instagram">{t("admin.settings.instagramUrl")}</label>
            <input
              id="settings-instagram"
              value={form.instagramUrl}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
            />
          </div>
        </Section>

        <Section title={t("admin.settings.bankSection")}>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-instructions-es">{t("admin.settings.instructionsEs")}</label>
              <textarea
                id="settings-instructions-es"
                rows={10}
                value={form.instructionsEs}
                onChange={(e) => updateField("instructionsEs", e.target.value)}
                placeholder={t("admin.settings.instructionsPlaceholder")}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-instructions-en">{t("admin.settings.instructionsEn")}</label>
              <textarea
                id="settings-instructions-en"
                rows={10}
                value={form.instructionsEn}
                onChange={(e) => updateField("instructionsEn", e.target.value)}
                placeholder={t("admin.settings.instructionsPlaceholder")}
              />
            </div>
          </div>
          <div className={formStyles.twoCol}>
            <div className={shared.field}>
              <label htmlFor="settings-reference-es">{t("admin.settings.referenceHintEs")}</label>
              <input
                id="settings-reference-es"
                value={form.referenceHintEs}
                onChange={(e) => updateField("referenceHintEs", e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="settings-reference-en">{t("admin.settings.referenceHintEn")}</label>
              <input
                id="settings-reference-en"
                value={form.referenceHintEn}
                onChange={(e) => updateField("referenceHintEn", e.target.value)}
              />
            </div>
          </div>
        </Section>

        {error && <p className={shared.error}>{error}</p>}

        <button type="submit" className={shared.button} disabled={saving}>
          {saving ? t("common.loading") : t("admin.settings.save")}
        </button>
      </form>
    </>
  );
}
