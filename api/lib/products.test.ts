/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { assertCompleteProductOrder, rowToProduct } from "./products.js";
import type { ProductRow } from "../../shared/db.types.js";

const sampleRow: ProductRow = {
  id: "prod-1",
  name: { es: "Camiseta", en: "Shirt" },
  description: { es: "Desc", en: "Desc" },
  price: "1500",
  image_url: "/products/prod-1.svg",
  variant_options: { size: { label: { es: "Talla", en: "Size" }, values: {} } },
  active: true,
  sort_order: 0,
  stock_quantity: 25,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("rowToProduct", () => {
  it("maps database row to Product shape", () => {
    const product = rowToProduct(sampleRow);
    expect(product.id).toBe("prod-1");
    expect(product.price).toBe(1500);
    expect(product.imageUrl).toBe("/products/prod-1.svg");
    expect(product.imageUrls).toEqual(["/products/prod-1.svg"]);
    expect(product.name).toBe("Camiseta");
    expect(product.stockQuantity).toBe(25);
  });

  it("maps an ordered gallery and falls back when it is empty", () => {
    const gallery = rowToProduct({
      ...sampleRow,
      image_urls: ["/products/prod-1.svg", "/products/prod-2.svg"],
    });
    expect(gallery.imageUrls).toEqual(["/products/prod-1.svg", "/products/prod-2.svg"]);

    const fallback = rowToProduct({ ...sampleRow, image_urls: [] });
    expect(fallback.imageUrl).toBe("/products/prod-1.svg");
    expect(fallback.imageUrls).toEqual(["/products/prod-1.svg"]);
  });
});

describe("assertCompleteProductOrder", () => {
  it("accepts a permutation of the existing ids", () => {
    expect(() => assertCompleteProductOrder(["a", "b"], ["b", "a"])).not.toThrow();
  });

  it("rejects a partial or duplicate order", () => {
    expect(() => assertCompleteProductOrder(["a", "b"], ["a"])).toThrow("invalid_order");
    expect(() => assertCompleteProductOrder(["a", "b"], ["a", "a"])).toThrow("invalid_order");
    expect(() => assertCompleteProductOrder(["a", "b"], ["a", "c"])).toThrow("invalid_order");
  });
});
