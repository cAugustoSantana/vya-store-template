import type { Locale } from "./types.js";

export type LocalizedField = Record<Locale, string>;

export type VariantValue = Record<Locale, string>;

export type VariantGroup = {
  label: LocalizedField;
  values: Record<string, VariantValue>;
};

export type ProductVariant = {
  key: string;
  options: Record<string, string>;
  price: number | null;
  stockQuantity: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variantOptions: Record<string, VariantGroup>;
  variants?: ProductVariant[];
  active?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
};
