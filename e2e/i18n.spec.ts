import { test, expect, switchLocale, gotoStorefront } from "./fixtures";

test("home shows products with locale switcher", async ({ page }) => {
  await gotoStorefront(page);
  await expect(page.getByRole("button", { name: "EN" })).toBeVisible();
  await expect(page.getByText(/Camiseta|Basic T-shirt/)).toBeVisible();
});

test("locale switch updates storefront copy", async ({ page }) => {
  await gotoStorefront(page);
  await page
    .getByRole("link", { name: /Camiseta|Basic T-shirt/i })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: /Agregar al pedido/i }),
  ).toBeVisible();
  await switchLocale(page, "EN");
  await expect(page.getByRole("button", { name: /Add to order/i })).toBeVisible();
  await switchLocale(page, "ES");
  await expect(
    page.getByRole("button", { name: /Agregar al pedido/i }),
  ).toBeVisible();
});
