/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { rowToProduct } from "./products.js";
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
    expect(product.name).toBe("Camiseta");
    expect(product.stockQuantity).toBe(25);
  });
});
