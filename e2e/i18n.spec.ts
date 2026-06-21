import { test, expect, switchLocale, gotoStorefront } from "./fixtures";

test("home shows products with locale switcher", async ({ page }) => {
  await gotoStorefront(page);
  await expect(page.getByRole("button", { name: "EN" })).toBeVisible();
  await expect(page.getByText(/Camiseta|Basic T-shirt/)).toBeVisible();
});

test("locale switch updates storefront copy", async ({ page }) => {
  await gotoStorefront(page);
  await switchLocale(page, "EN");
  await expect(page.getByText("Basic T-shirt")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Agregar al pedido|Add to order/i }).first(),
  ).not.toBeVisible();
  await switchLocale(page, "ES");
  await expect(page.getByText("Camiseta")).toBeVisible();
});
