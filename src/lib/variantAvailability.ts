import type { Product } from "@shared/product.types";
import {
  enumerateOptionCombinations,
  hasVariantInventory,
  variantStock,
} from "@shared/productVariants";

export function isOptionValueAvailable(
  product: Product,
  groupKey: string,
  valueKey: string,
  selected: Record<string, string>,
): boolean {
  if (!hasVariantInventory(product)) {
    return (product.stockQuantity ?? 0) > 0;
  }

  const hypothetical = { ...selected, [groupKey]: valueKey };
  const requiredKeys = Object.keys(product.variantOptions);
  const missing = requiredKeys.filter((key) => !hypothetical[key]);

  if (missing.length === 0) {
    return variantStock(product, hypothetical) > 0;
  }

  return enumerateOptionCombinations(product.variantOptions)
    .filter((combo) => combo[groupKey] === valueKey)
    .some((combo) => variantStock(product, combo) > 0);
}
