import { test, expect, gotoStorefront, addDefaultProductToCart } from "./fixtures";

test("storefront shows products and cart sidebar", async ({ page }) => {
  await gotoStorefront(page);
  await expect(page.getByText(/Gorra|Logo Cap/)).toBeVisible();
  await expect(page.getByRole("complementary", { name: /pedido|order/i })).toBeVisible();
});

test("add to cart updates total", async ({ page }) => {
  await addDefaultProductToCart(page);
  await expect(page.getByRole("complementary")).toContainText(/1\.500|1,500/);
  await expect(page.getByRole("link", { name: /Ir al checkout|Go to checkout/i })).toBeVisible();
});
