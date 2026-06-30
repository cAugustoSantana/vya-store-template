import type { ProductVariant } from "../../shared/product.types.js";
import {
  buildVariantKey,
  hasVariantInventory,
  totalVariantStock,
} from "../../shared/productVariants.js";
import { getProductById } from "./products.js";
import { getSql } from "./db.js";

export type StockLine = {
  productId: string;
  variants: Record<string, string>;
  quantity: number;
};

export async function decrementProductStock(
  productId: string,
  quantity: number,
): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE products
    SET stock_quantity = stock_quantity - ${quantity},
        updated_at = now()
    WHERE id = ${productId}
      AND stock_quantity >= ${quantity}
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function restoreProductStock(productId: string, quantity: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE products
    SET stock_quantity = stock_quantity + ${quantity},
        updated_at = now()
    WHERE id = ${productId}
  `;
}

function applyVariantStockChange(
  variants: ProductVariant[],
  variantKey: string,
  delta: number,
): ProductVariant[] | null {
  let found = false;
  const next = variants.map((variant) => {
    if (variant.key !== variantKey) return variant;
    found = true;
    const stockQuantity = variant.stockQuantity + delta;
    if (stockQuantity < 0) return variant;
    return { ...variant, stockQuantity };
  });
  if (!found) return null;
  return next;
}

async function persistVariants(
  productId: string,
  variants: ProductVariant[],
): Promise<boolean> {
  const sql = getSql();
  const stockQuantity = totalVariantStock(variants);
  const rows = (await sql`
    UPDATE products
    SET variants = ${JSON.stringify(variants)}::jsonb,
        stock_quantity = ${stockQuantity},
        updated_at = now()
    WHERE id = ${productId}
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function decrementVariantStock(
  productId: string,
  variants: Record<string, string>,
  quantity: number,
): Promise<boolean> {
  const product = await getProductById(productId);
  if (!product || !hasVariantInventory(product)) return false;

  const variantKey = buildVariantKey(variants);
  const current = product.variants ?? [];
  const target = current.find((variant) => variant.key === variantKey);
  if (!target || target.stockQuantity < quantity) return false;

  const next = applyVariantStockChange(current, variantKey, -quantity);
  if (!next) return false;
  return persistVariants(productId, next);
}

export async function restoreVariantStock(
  productId: string,
  variants: Record<string, string>,
  quantity: number,
): Promise<void> {
  const product = await getProductById(productId);
  if (!product || !hasVariantInventory(product)) {
    await restoreProductStock(productId, quantity);
    return;
  }

  const variantKey = buildVariantKey(variants);
  const next = applyVariantStockChange(product.variants ?? [], variantKey, quantity);
  if (!next) return;
  await persistVariants(productId, next);
}

export async function decrementStockLine(line: StockLine): Promise<boolean> {
  const product = await getProductById(line.productId);
  if (!product) return false;
  if (hasVariantInventory(product)) {
    return decrementVariantStock(line.productId, line.variants, line.quantity);
  }
  return decrementProductStock(line.productId, line.quantity);
}

export async function restoreStockLine(line: StockLine): Promise<void> {
  const product = await getProductById(line.productId);
  if (!product) return;
  if (hasVariantInventory(product)) {
    await restoreVariantStock(line.productId, line.variants, line.quantity);
    return;
  }
  await restoreProductStock(line.productId, line.quantity);
}

export function aggregateStockLines(lines: StockLine[]): StockLine[] {
  const totals = new Map<string, StockLine>();
  for (const line of lines) {
    const key = `${line.productId}:${buildVariantKey(line.variants)}`;
    const existing = totals.get(key);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      totals.set(key, {
        productId: line.productId,
        variants: line.variants,
        quantity: line.quantity,
      });
    }
  }
  return [...totals.values()];
}

/** @deprecated use aggregateStockLines */
export function aggregateLineQuantities(
  lines: { productId: string; quantity: number }[],
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const line of lines) {
    totals.set(line.productId, (totals.get(line.productId) ?? 0) + line.quantity);
  }
  return totals;
}
