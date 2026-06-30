import { describe, expect, it } from "vitest";
import {
  buildVariantKey,
  enumerateOptionCombinations,
  findVariant,
  productTotalStock,
  resolveProductLinePrice,
  syncVariantsFromOptions,
  variantStock,
} from "./productVariants.js";
import type { ProductVariant } from "./product.types.js";

const sizeOptions = {
  size: {
    label: { es: "Talla", en: "Size" },
    values: {
      s: { es: "S", en: "S" },
      m: { es: "M", en: "M" },
      l: { es: "L", en: "L" },
    },
  },
};

describe("productVariants", () => {
  it("builds stable variant keys", () => {
    expect(buildVariantKey({ size: "m", color: "black" })).toBe("color:black|size:m");
  });

  it("enumerates option combinations", () => {
    expect(enumerateOptionCombinations(sizeOptions)).toEqual([
      { size: "s" },
      { size: "m" },
      { size: "l" },
    ]);
  });

  it("syncs variants while preserving existing stock", () => {
    const existing: ProductVariant[] = [
      { key: "size:m", options: { size: "m" }, price: 30, stockQuantity: 2 },
    ];
    const synced = syncVariantsFromOptions(sizeOptions, existing);
    expect(synced).toHaveLength(3);
    expect(findVariant(synced, { size: "m" })?.stockQuantity).toBe(2);
    expect(findVariant(synced, { size: "s" })?.stockQuantity).toBe(0);
  });

  it("resolves variant price and stock", () => {
    const product = {
      price: 25,
      stockQuantity: 0,
      variantOptions: sizeOptions,
      variants: [
        { key: "size:s", options: { size: "s" }, price: null, stockQuantity: 2 },
        { key: "size:m", options: { size: "m" }, price: 30, stockQuantity: 5 },
      ],
    };
    expect(productTotalStock(product)).toBe(7);
    expect(variantStock(product, { size: "s" })).toBe(2);
    expect(resolveProductLinePrice(product as never, { size: "m" })).toBe(30);
    expect(resolveProductLinePrice(product as never, { size: "s" })).toBe(25);
  });
});
