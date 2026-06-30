import type { Product } from "@shared/product.types";
import type { CartLine } from "@/types/commerce";
import {
  buildVariantKey,
  productTotalStock,
  resolveProductLinePrice,
  variantStock,
} from "@shared/productVariants";

export function productStock(product: Product | undefined): number {
  if (!product) return 0;
  return productTotalStock(product);
}

export function cartQuantityForVariant(
  lines: CartLine[],
  productId: string,
  variants: Record<string, string>,
  excludeLineId?: string,
): number {
  const key = buildVariantKey(variants);
  return lines
    .filter(
      (line) =>
        line.productId === productId &&
        line.lineId !== excludeLineId &&
        buildVariantKey(line.variants) === key,
    )
    .reduce((sum, line) => sum + line.quantity, 0);
}

export function cartQuantityForProduct(
  lines: CartLine[],
  productId: string,
  excludeLineId?: string,
): number {
  return lines
    .filter((line) => line.productId === productId && line.lineId !== excludeLineId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

export function availableStock(
  product: Product | undefined,
  lines: CartLine[],
  variants?: Record<string, string>,
  excludeLineId?: string,
): number {
  if (!product) return 0;
  if (variants && Object.keys(variants).length > 0) {
    return Math.max(
      0,
      variantStock(product, variants) -
        cartQuantityForVariant(lines, product.id, variants, excludeLineId),
    );
  }
  return Math.max(
    0,
    productStock(product) - cartQuantityForProduct(lines, product.id, excludeLineId),
  );
}

export function maxPurchasableQuantity(
  product: Product | undefined,
  lines: CartLine[],
  variants?: Record<string, string>,
  excludeLineId?: string,
): number {
  return Math.min(99, availableStock(product, lines, variants, excludeLineId));
}

export function lineUnitPrice(
  product: Product | undefined,
  variants: Record<string, string>,
): number {
  if (!product) return 0;
  return resolveProductLinePrice(product, variants);
}
