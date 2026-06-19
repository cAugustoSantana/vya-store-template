import { test, expect, hasE2eDatabase, fillCheckoutForm, addDefaultProductToCart } from "./fixtures";

test("checkout without cart shows empty message", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText(/Agrega productos|Add products/i)).toBeVisible();
});

test("checkout validates required fields", async ({ page }) => {
  await addDefaultProductToCart(page);
  await page.getByRole("link", { name: /Ir al checkout|Go to checkout/i }).click();
  await page.getByRole("button", { name: /Finalizar pedido|Place order/i }).click();
  await expect(page.getByText(/obligatorio|required/i).first()).toBeVisible();
});

test("checkout creates order and redirects to payment page", async ({ page }, testInfo) => {
  if (!hasE2eDatabase()) testInfo.skip();
  await addDefaultProductToCart(page);
  await page.getByRole("link", { name: /checkout/i }).click();
  await fillCheckoutForm(page);
  await page.getByRole("button", { name: /Finalizar pedido|Place order/i }).click();
  await page.waitForURL(/\/order\/payment\/MITIENDA-[a-f0-9]+/i);
  await expect(page.getByText(/MITIENDA-[a-f0-9]+/i)).toBeVisible();
  await expect(page.getByText("1234567890")).toBeVisible();
});
