import type { Locale } from "../../shared/types.js";
import { storeConfig } from "./config.js";

export type CartLineInput = {
  productId: string;
  variants: Record<string, string>;
  quantity: number;
};

export type ValidatedCartLine = {
  productId: string;
  productName: string;
  variants: Record<string, string>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CheckoutInput = {
  locale: string;
  buyer: { name: string; phone: string; email: string };
  items: CartLineInput[];
  honeypot?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QUANTITY = 99;
const MAX_LINES = 20;

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const { defaultCountryCode, localDigits } = storeConfig.phone;

  if (digits.length === localDigits) {
    return `${defaultCountryCode}${digits}`;
  }
  return digits;
}

export function isValidPhone(digits: string): boolean {
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isSupportedLocale(locale: string): locale is Locale {
  return (storeConfig.supportedLocales as readonly string[]).includes(locale);
}

function findProduct(productId: string) {
  return storeConfig.products.find((p) => p.id === productId);
}

function validateVariants(
  product: (typeof storeConfig.products)[number],
  variants: Record<string, string>,
): Record<string, string> {
  const groups = Object.keys(product.variantOptions);
  const normalized: Record<string, string> = {};

  for (const groupKey of groups) {
    const valueKey = variants[groupKey];
    if (!valueKey) {
      throw new Error("missing_variant");
    }
    const group = product.variantOptions[groupKey as keyof typeof product.variantOptions];
    const values = group?.values as Record<string, unknown> | undefined;
    if (!values?.[valueKey]) {
      throw new Error("invalid_variant");
    }
    normalized[groupKey] = valueKey;
  }

  for (const key of Object.keys(variants)) {
    if (!groups.includes(key)) {
      throw new Error("invalid_variant");
    }
  }

  return normalized;
}

export function validateCheckout(input: CheckoutInput): {
  locale: Locale;
  buyer: { name: string; phone: string; email: string };
  lines: ValidatedCartLine[];
  total: number;
} {
  if (input.honeypot) {
    throw new Error("honeypot");
  }

  if (!isSupportedLocale(input.locale)) {
    throw new Error("invalid_locale");
  }

  const name = input.buyer?.name?.trim();
  const email = input.buyer?.email?.trim();
  const phoneDigits = normalizePhone(input.buyer?.phone ?? "");

  if (!name) throw new Error("invalid_name");
  if (!isValidEmail(email ?? "")) throw new Error("invalid_email");
  if (!isValidPhone(phoneDigits)) throw new Error("invalid_phone");

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("empty_cart");
  }
  if (input.items.length > MAX_LINES) {
    throw new Error("cart_too_large");
  }

  const lines: ValidatedCartLine[] = [];
  let total = 0;

  for (const item of input.items) {
    const product = findProduct(item.productId);
    if (!product) throw new Error("invalid_product");

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
      throw new Error("invalid_quantity");
    }

    const variants = validateVariants(product, item.variants ?? {});
    const unitPrice = product.price;
    const lineTotal = unitPrice * qty;
    total += lineTotal;

    lines.push({
      productId: product.id,
      productName: product.name[input.locale] ?? product.name[storeConfig.defaultLocale],
      variants,
      quantity: qty,
      unitPrice,
      lineTotal,
    });
  }

  return {
    locale: input.locale,
    buyer: { name, phone: phoneDigits, email: email! },
    lines,
    total,
  };
}

export function isValidOrderStatus(status: string): boolean {
  return (storeConfig.orderStatuses as readonly string[]).includes(status);
}

// Keep under Vercel's ~4.5MB request limit (base64 adds ~33% overhead in JSON).
export const PROOF_MAX_BYTES = 3 * 1024 * 1024;

const PNG = [0x89, 0x50, 0x4e, 0x47];
const JPEG = [0xff, 0xd8, 0xff];

export function validateProofImage(buffer: Buffer, mimeType?: string): "image/png" | "image/jpeg" {
  if (buffer.length > PROOF_MAX_BYTES) {
    throw new Error("file_too_large");
  }

  const isPng = PNG.every((b, i) => buffer[i] === b);
  const isJpeg = JPEG.every((b, i) => buffer[i] === b);

  if (isPng) return "image/png";
  if (isJpeg) return "image/jpeg";

  if (mimeType === "image/png" || mimeType === "image/jpeg") {
    throw new Error("invalid_image_magic");
  }
  throw new Error("invalid_image_type");
}
