import { storeConfig } from "../../shared/store.config.js";
import type {
  PublicStoreSettings,
  StoreSettingsData,
} from "../../shared/storeSettings.types.js";
import type { Locale } from "../../shared/types.js";
import { resolvePublicLogoUrl as resolvePublicLogoUrlShared } from "../../shared/imageUrl.js";
import { getSql } from "./db.js";

export type StoreSettingsRow = {
  id: number;
  config: Partial<StoreSettingsData>;
  updated_at: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function resolvePublicLogoUrl(logoUrl: string): string {
  const blobAccess = process.env.BLOB_ACCESS === "public" ? "public" : "private";
  return resolvePublicLogoUrlShared(logoUrl, blobAccess);
}

export function defaultStoreSettings(): StoreSettingsData {
  const base = structuredClone(storeConfig);
  return {
    ...base,
    supportedLocales: [...base.supportedLocales],
    orderStatuses: [...base.orderStatuses],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeLocalized(
  base: Record<Locale, string>,
  patch?: Partial<Record<Locale, string>>,
): Record<Locale, string> {
  return {
    es: patch?.es?.trim() || base.es,
    en: patch?.en?.trim() || base.en,
  };
}

type LegacyBankTransfer = {
  instructions?: Partial<Record<Locale, string>>;
  bankName?: string | Partial<Record<Locale, string>>;
  accountName?: string;
  accountNumber?: string;
  accountType?: Partial<Record<Locale, string>>;
  referenceHint?: Partial<Record<Locale, string>>;
};

function legacyBankInstructions(
  bt: LegacyBankTransfer,
  locale: Locale,
): string {
  const lines: string[] = [];
  const bankName =
    typeof bt.bankName === "string"
      ? bt.bankName
      : bt.bankName?.[locale] ?? bt.bankName?.es ?? "";
  if (bankName.trim()) {
    lines.push(locale === "es" ? `Banco: ${bankName.trim()}` : `Bank: ${bankName.trim()}`);
  }
  if (bt.accountName?.trim()) {
    lines.push(
      locale === "es"
        ? `Titular: ${bt.accountName.trim()}`
        : `Account holder: ${bt.accountName.trim()}`,
    );
  }
  if (bt.accountNumber?.trim()) {
    lines.push(
      locale === "es"
        ? `Cuenta: ${bt.accountNumber.trim()}`
        : `Account: ${bt.accountNumber.trim()}`,
    );
  }
  const accountType = bt.accountType?.[locale] ?? bt.accountType?.es;
  if (accountType?.trim()) {
    lines.push(locale === "es" ? `Tipo: ${accountType.trim()}` : `Type: ${accountType.trim()}`);
  }
  return lines.join("\n");
}

function mergeBankTransferInstructions(
  base: StoreSettingsData["payment"]["bankTransfer"],
  stored?: LegacyBankTransfer | null,
): Record<Locale, string> {
  if (stored?.instructions) {
    return mergeLocalized(base.instructions, stored.instructions);
  }
  if (
    stored &&
    (stored.bankName || stored.accountName || stored.accountNumber)
  ) {
    return {
      es: legacyBankInstructions(stored, "es") || base.instructions.es,
      en: legacyBankInstructions(stored, "en") || base.instructions.en,
    };
  }
  return base.instructions;
}

function mergeBankTransfer(
  base: StoreSettingsData["payment"]["bankTransfer"],
  stored: LegacyBankTransfer | undefined,
): StoreSettingsData["payment"]["bankTransfer"] {
  return {
    instructions: mergeBankTransferInstructions(base, stored),
    referenceHint: mergeLocalized(base.referenceHint, stored?.referenceHint),
  };
}

export function mergeStoreSettings(
  stored: Partial<StoreSettingsData> | null | undefined,
): StoreSettingsData {
  const base = defaultStoreSettings();
  if (!stored || !isRecord(stored)) return base;

  return {
    storeSlug: stored.storeSlug?.trim() || base.storeSlug,
    storeName: mergeLocalized(base.storeName, stored.storeName),
    description: mergeLocalized(base.description, stored.description),
    defaultLocale:
      stored.defaultLocale && base.supportedLocales.includes(stored.defaultLocale)
        ? stored.defaultLocale
        : base.defaultLocale,
    supportedLocales: base.supportedLocales,
    currency: stored.currency?.trim() || base.currency,
    taxRate:
      typeof stored.taxRate === "number" && stored.taxRate >= 0 && stored.taxRate <= 1
        ? stored.taxRate
        : base.taxRate,
    primaryColor: stored.primaryColor?.trim() || base.primaryColor,
    logoUrl: stored.logoUrl?.trim() || base.logoUrl,
    phone: {
      defaultCountryCode:
        stored.phone?.defaultCountryCode?.trim() || base.phone.defaultCountryCode,
      localDigits:
        typeof stored.phone?.localDigits === "number" && stored.phone.localDigits > 0
          ? stored.phone.localDigits
          : base.phone.localDigits,
    },
    email: {
      from: stored.email?.from?.trim() || base.email.from,
    },
    contact: {
      whatsappCountryCode:
        stored.contact?.whatsappCountryCode?.trim() || base.contact.whatsappCountryCode,
      whatsappNumber: stored.contact?.whatsappNumber?.trim() || base.contact.whatsappNumber,
      instagramUrl: stored.contact?.instagramUrl?.trim() || base.contact.instagramUrl,
      ownerEmail: stored.contact?.ownerEmail?.trim() || base.contact.ownerEmail,
    },
    payment: {
      provider: base.payment.provider,
      bankTransfer: mergeBankTransfer(
        base.payment.bankTransfer,
        stored.payment?.bankTransfer as LegacyBankTransfer | undefined,
      ),
    },
    orderStatuses: base.orderStatuses,
    defaultOrderStatus: base.defaultOrderStatus,
  };
}

export function toPublicStoreSettings(config: StoreSettingsData): PublicStoreSettings {
  const { email, contact, ...rest } = config;
  void email;
  return {
    ...rest,
    logoUrl: resolvePublicLogoUrl(rest.logoUrl),
    contact: {
      whatsappCountryCode: contact.whatsappCountryCode,
      whatsappNumber: contact.whatsappNumber,
      instagramUrl: contact.instagramUrl,
    },
  };
}

export function validateStoreSettings(input: unknown): StoreSettingsData {
  if (!isRecord(input)) throw new Error("invalid_settings");

  const merged = mergeStoreSettings(input as Partial<StoreSettingsData>);

  if (!/^[A-Z0-9_-]+$/i.test(merged.storeSlug)) throw new Error("invalid_store_slug");
  if (!merged.storeName.es || !merged.storeName.en) throw new Error("invalid_store_name");
  if (!merged.description.es || !merged.description.en) throw new Error("invalid_description");
  if (!merged.currency.trim()) throw new Error("invalid_currency");
  if (!HEX_COLOR_RE.test(merged.primaryColor)) throw new Error("invalid_primary_color");
  if (!merged.logoUrl.trim()) throw new Error("invalid_logo_url");
  if (!merged.email.from.trim()) throw new Error("invalid_email_from");
  if (!EMAIL_RE.test(merged.contact.ownerEmail)) throw new Error("invalid_owner_email");
  if (!merged.contact.whatsappNumber.trim()) throw new Error("invalid_whatsapp_number");
  if (!merged.payment.bankTransfer.instructions.es.trim()) throw new Error("invalid_bank_instructions");
  if (!merged.payment.bankTransfer.instructions.en.trim()) throw new Error("invalid_bank_instructions");

  return merged;
}

export async function getStoredSettingsPatch(): Promise<Partial<StoreSettingsData> | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT config, updated_at FROM store_settings WHERE id = 1 LIMIT 1
  `) as { config: Partial<StoreSettingsData>; updated_at: string }[];

  return rows[0]?.config ?? null;
}

export async function getStoreSettingsUpdatedAt(): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT updated_at FROM store_settings WHERE id = 1 LIMIT 1
  `) as { updated_at: string }[];
  return rows[0]?.updated_at ?? null;
}

export async function getStoreConfig(): Promise<StoreSettingsData> {
  try {
    const patch = await getStoredSettingsPatch();
    return mergeStoreSettings(patch);
  } catch {
    return defaultStoreSettings();
  }
}

export async function saveStoreSettings(input: unknown): Promise<StoreSettingsData> {
  const config = validateStoreSettings(input);
  const sql = getSql();
  await sql`
    INSERT INTO store_settings (id, config, updated_at)
    VALUES (1, ${JSON.stringify(config)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      config = EXCLUDED.config,
      updated_at = now()
  `;
  return config;
}

export function localizedField(
  field: Record<Locale, string>,
  locale: Locale,
  config: StoreSettingsData,
): string {
  return field[locale] ?? field[config.defaultLocale];
}
