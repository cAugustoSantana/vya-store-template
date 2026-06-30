import type { Product, ProductVariant, VariantGroup } from "./product.types.js";

export function buildVariantKey(options: Record<string, string>): string {
  return Object.keys(options)
    .sort()
    .map((key) => `${key}:${options[key]}`)
    .join("|");
}

export function enumerateOptionCombinations(
  variantOptions: Record<string, VariantGroup>,
): Record<string, string>[] {
  const groups = Object.entries(variantOptions);
  if (groups.length === 0) return [];

  let combos: Record<string, string>[] = [{}];
  for (const [groupKey, group] of groups) {
    const valueKeys = Object.keys(group.values);
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const valueKey of valueKeys) {
        next.push({ ...combo, [groupKey]: valueKey });
      }
    }
    combos = next;
  }
  return combos;
}

export function hasVariantInventory(product: {
  variantOptions: Record<string, unknown>;
  variants?: ProductVariant[];
}): boolean {
  return Object.keys(product.variantOptions).length > 0 && (product.variants?.length ?? 0) > 0;
}

export function syncVariantsFromOptions(
  variantOptions: Record<string, VariantGroup>,
  existing: ProductVariant[] = [],
): ProductVariant[] {
  const combos = enumerateOptionCombinations(variantOptions);
  if (combos.length === 0) return [];

  const existingByKey = new Map(existing.map((variant) => [variant.key, variant]));
  return combos.map((options) => {
    const key = buildVariantKey(options);
    const prev = existingByKey.get(key);
    return {
      key,
      options,
      price: prev?.price ?? null,
      stockQuantity: prev?.stockQuantity ?? 0,
    };
  });
}

export function findVariant(
  variants: ProductVariant[] | undefined,
  options: Record<string, string>,
): ProductVariant | null {
  const key = buildVariantKey(options);
  return variants?.find((variant) => variant.key === key) ?? null;
}

export function resolveVariantPrice(basePrice: number, variant: ProductVariant | null): number {
  if (variant?.price != null && variant.price >= 0) return variant.price;
  return basePrice;
}

export function resolveProductLinePrice(product: Product, options: Record<string, string>): number {
  if (!hasVariantInventory(product)) return product.price;
  return resolveVariantPrice(product.price, findVariant(product.variants, options));
}

export function totalVariantStock(variants: ProductVariant[] | undefined): number {
  return (variants ?? []).reduce((sum, variant) => sum + Math.max(0, variant.stockQuantity), 0);
}

export function productTotalStock(product: Pick<Product, "stockQuantity" | "variantOptions" | "variants">): number {
  if (hasVariantInventory(product)) {
    return totalVariantStock(product.variants);
  }
  return Math.max(0, product.stockQuantity ?? 0);
}

export function variantStock(
  product: Pick<Product, "stockQuantity" | "variantOptions" | "variants">,
  options: Record<string, string>,
): number {
  if (hasVariantInventory(product)) {
    return Math.max(0, findVariant(product.variants, options)?.stockQuantity ?? 0);
  }
  return Math.max(0, product.stockQuantity ?? 0);
}

export function formatVariantLabel(
  options: Record<string, string>,
  variantOptions: Record<string, VariantGroup>,
  locale: "es" | "en",
): string {
  return Object.keys(options)
    .sort()
    .map((groupKey) => {
      const valueKey = options[groupKey];
      const label = variantOptions[groupKey]?.values[valueKey]?.[locale] ?? valueKey;
      return label;
    })
    .join(" / ");
}

export function normalizeVariantsInput(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  const normalized: ProductVariant[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const options =
      record.options && typeof record.options === "object" && !Array.isArray(record.options)
        ? (record.options as Record<string, string>)
        : null;
    if (!options || Object.keys(options).length === 0) continue;
    const stockQuantity = Number(record.stockQuantity);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) continue;
    const priceRaw = record.price;
    const price =
      priceRaw == null || priceRaw === ""
        ? null
        : Number(priceRaw);
    if (price != null && (Number.isNaN(price) || price < 0)) continue;
    normalized.push({
      key: buildVariantKey(options),
      options,
      price,
      stockQuantity,
    });
  }
  return normalized;
}
