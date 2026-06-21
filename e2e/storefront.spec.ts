import { test, expect, gotoStorefront, addDefaultProductToCart } from "./fixtures";

test("storefront shows product cards", async ({ page }) => {
  await gotoStorefront(page);
  await expect(page.getByText(/Gorra|Logo Cap/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Camiseta|Basic T-shirt/i }).first(),
  ).toBeVisible();
});

test("add to cart opens drawer with total", async ({ page }) => {
  await addDefaultProductToCart(page);
  await expect(page.getByRole("dialog", { name: /Tu pedido|Your order/i })).toContainText(
    /1\.500|1,500/,
  );
  await expect(
    page.getByRole("link", { name: /Ir al checkout|Proceed to checkout/i }),
  ).toBeVisible();
});
