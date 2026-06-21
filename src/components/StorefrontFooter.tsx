import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { getLocalized } from "@/lib/localized";
import { resolvePublicLogoUrl } from "@/lib/logoUrl";
import type { Locale } from "@shared/types";

function whatsAppUrl(countryCode: string, number: string): string {
  const digits = `${countryCode}${number}`.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function StorefrontFooter() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const year = new Date().getFullYear();
  const settings = useStoreConfig();
  const storeName = getLocalized(settings.storeName, locale);
  const logoSrc = resolvePublicLogoUrl(settings.logoUrl);
  const waUrl = whatsAppUrl(settings.contact.whatsappCountryCode, settings.contact.whatsappNumber);

  return (
    <footer className="mt-auto shrink-0 border-t border-gray-200/80 bg-white print:hidden">
      <section className="border-b border-brand-500/20 bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 py-5 text-center md:flex-row md:justify-between md:text-left lg:px-8 lg:py-6">
          <div className="max-w-xl">
            <p className="text-base font-bold tracking-tight lg:text-lg">
              {t("footer.template.title")}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-brand-100">
              {t("footer.template.subtitle")}
            </p>
          </div>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-lg shadow-brand-900/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-50"
          >
            {t("footer.template.cta")}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </a>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-5 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <img
            src={logoSrc}
            alt={storeName}
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-sm font-bold text-gray-500">
            {storeName} © {year}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-600"
            aria-label="WhatsApp"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            WhatsApp
          </a>
          {settings.contact.instagramUrl && (
            <a
              href={settings.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-600"
              aria-label="Instagram"
            >
              <InstagramLogo size={18} weight="fill" aria-hidden />
              Instagram
            </a>
          )}
          <Link
            to="/admin"
            className="text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
          >
            {t("nav.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
