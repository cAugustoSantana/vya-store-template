import type { ProductRow } from "../../shared/db.types.js";
import type { Product, ProductVariant, VariantGroup } from "../../shared/product.types.js";
import {
  normalizeProductTextInput,
  productTextFromStored,
  productTextToStored,
} from "../../shared/productText.js";
import {
  normalizeVariantsInput,
  syncVariantsFromOptions,
  totalVariantStock,
} from "../../shared/productVariants.js";
import { sanitizePersistedImageUrl } from "../../shared/imageUrl.js";
import { getSql } from "./db.js";

function parseJsonField<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function parseVariants(raw: unknown): ProductVariant[] {
  return normalizeVariantsInput(raw);
}

export function rowToProduct(row: ProductRow): Product {
  const nameRaw = parseJsonField(row.name);
  const descriptionRaw = parseJsonField(row.description);
  const variants = parseVariants(row.variants ?? []);
  return {
    id: row.id,
    name: productTextFromStored(nameRaw),
    description: productTextFromStored(descriptionRaw),
    price: Number(row.price),
    imageUrl: sanitizePersistedImageUrl(row.image_url),
    variantOptions: parseJsonField(row.variant_options) as Record<string, VariantGroup>,
    variants,
    active: row.active,
    sortOrder: row.sort_order,
    stockQuantity: row.stock_quantity,
  };
}

function resolveVariantsForWrite(
  variantOptions: Record<string, unknown>,
  variants: ProductVariant[] | undefined,
  stockQuantity: number | undefined,
): { variants: ProductVariant[]; stockQuantity: number } {
  const options = variantOptions as Record<string, VariantGroup>;
  const synced = syncVariantsFromOptions(options, variants ?? []);
  if (synced.length > 0) {
    return { variants: synced, stockQuantity: totalVariantStock(synced) };
  }
  return {
    variants: [],
    stockQuantity: stockQuantity ?? 0,
  };
}

export async function listActiveProducts(): Promise<Product[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM products
    WHERE active = true
    ORDER BY sort_order ASC, id ASC
  `) as ProductRow[];
  return rows.map(rowToProduct);
}

export async function listAllProducts(): Promise<Product[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM products
    ORDER BY sort_order ASC, id ASC
  `) as ProductRow[];
  return rows.map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM products WHERE id = ${id} LIMIT 1
  `) as ProductRow[];
  const row = rows[0];
  return row ? rowToProduct(row) : null;
}

export async function getProductImageUrl(id: string): Promise<string | null> {
  const product = await getProductById(id);
  return product?.imageUrl ?? null;
}

export type ProductInput = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variantOptions: Record<string, unknown>;
  variants?: ProductVariant[];
  active?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
};

export type ProductWriteFields = {
  name?: string | Record<string, string>;
  description?: string | Record<string, string>;
  price?: number;
  imageUrl?: string;
  variantOptions?: Record<string, unknown>;
  variants?: ProductVariant[];
  active?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
};

function resolveProductText(value: string | Record<string, string>): string {
  const normalized = normalizeProductTextInput(value);
  if (!normalized) throw new Error("invalid_product_text");
  return normalized;
}

export async function createProduct(
  input: ProductWriteFields & { id: string; name: string | Record<string, string>; description: string | Record<string, string>; price: number },
): Promise<Product> {
  const name = resolveProductText(input.name);
  const description = resolveProductText(input.description);
  const variantOptions = input.variantOptions ?? {};
  const { variants, stockQuantity } = resolveVariantsForWrite(
    variantOptions,
    input.variants,
    input.stockQuantity,
  );
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO products (
      id, name, description, price, image_url, variant_options, variants, active, sort_order, stock_quantity
    ) VALUES (
      ${input.id},
      ${JSON.stringify(productTextToStored(name))}::jsonb,
      ${JSON.stringify(productTextToStored(description))}::jsonb,
      ${input.price},
      ${sanitizePersistedImageUrl(input.imageUrl)},
      ${JSON.stringify(variantOptions)}::jsonb,
      ${JSON.stringify(variants)}::jsonb,
      ${input.active ?? true},
      ${input.sortOrder ?? 0},
      ${stockQuantity}
    )
    RETURNING *
  `) as ProductRow[];
  return rowToProduct(rows[0]!);
}

export async function updateProduct(id: string, input: ProductWriteFields): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const name = input.name !== undefined ? resolveProductText(input.name) : existing.name;
  const description =
    input.description !== undefined ? resolveProductText(input.description) : existing.description;
  const variantOptions = input.variantOptions ?? existing.variantOptions;
  const { variants, stockQuantity } = resolveVariantsForWrite(
    variantOptions,
    input.variants ?? existing.variants,
    input.stockQuantity ?? existing.stockQuantity,
  );

  const sql = getSql();
  const rows = (await sql`
    UPDATE products SET
      name = ${JSON.stringify(productTextToStored(name))}::jsonb,
      description = ${JSON.stringify(productTextToStored(description))}::jsonb,
      price = ${input.price ?? existing.price},
      image_url = ${input.imageUrl !== undefined ? sanitizePersistedImageUrl(input.imageUrl, sanitizePersistedImageUrl(existing.imageUrl)) : existing.imageUrl},
      variant_options = ${JSON.stringify(variantOptions)}::jsonb,
      variants = ${JSON.stringify(variants)}::jsonb,
      active = ${input.active ?? existing.active ?? true},
      sort_order = ${input.sortOrder ?? existing.sortOrder ?? 0},
      stock_quantity = ${stockQuantity},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : null;
}

export async function deactivateProduct(id: string): Promise<Product | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE products SET active = false, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM products WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function updateProductImageUrl(id: string, imageUrl: string): Promise<Product | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE products SET image_url = ${imageUrl}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : null;
}
