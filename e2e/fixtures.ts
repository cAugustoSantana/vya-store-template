import { test as base, expect, type Page } from "@playwright/test";
import { hasE2eBlob, hasE2eDatabase, uniqueEmail } from "./helpers";

export { expect, hasE2eBlob, hasE2eDatabase, uniqueEmail };

export const test = base;

export async function gotoStorefront(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("link", { name: /Camiseta|Basic T-shirt|Gorra|Logo Cap/i }).first(),
  ).toBeVisible({ timeout: 15_000 });
}

export async function openDefaultProduct(page: Page) {
  await gotoStorefront(page);
  await page
    .getByRole("link", { name: /Camiseta|Basic T-shirt/i })
    .first()
    .click();
  await page.waitForURL(/\/products\//);
  await expect(
    page.getByRole("button", { name: /Agregar al pedido|Add to order/i }),
  ).toBeVisible();
}

export async function switchLocale(page: Page, locale: "EN" | "ES") {
  await page.getByRole("button", { name: locale }).click();
}

export async function addDefaultProductToCart(page: Page) {
  await openDefaultProduct(page);
  await page.getByRole("button", { name: /Agregar al pedido|Add to order/i }).click();
  await expect(page.getByRole("dialog", { name: /Tu pedido|Your order/i })).toBeVisible();
}

export async function goToCheckoutFromDrawer(page: Page) {
  await page
    .getByRole("link", { name: /Ir al checkout|Proceed to checkout/i })
    .click();
}

export async function fillCheckoutForm(
  page: Page,
  overrides: Partial<{ name: string; phone: string; email: string }> = {},
) {
  const data = {
    name: "E2E Buyer",
    phone: "+1 849 620 2020",
    email: uniqueEmail(),
    ...overrides,
  };
  await page.locator("#checkout-name").fill(data.name);
  await page.locator("#checkout-phone").fill(data.phone);
  await page.locator("#checkout-email").fill(data.email);
  await page.locator("#checkout-address").fill("123 Street Name, Neighborhood");
  await page.locator("#checkout-city").fill("Santo Domingo");
  await page.locator("#checkout-postal").fill("10101");
  return data;
}

export async function completeCheckout(page: Page): Promise<string> {
  await addDefaultProductToCart(page);
  await goToCheckoutFromDrawer(page);
  await fillCheckoutForm(page);
  await page.getByRole("button", { name: /Finalizar pedido|Place order/i }).click();
  await page.waitForURL(/\/order\/payment\/MITIENDA-[a-f0-9]+/i);
  const match = page.url().match(/MITIENDA-[a-f0-9]+/i);
  if (!match) throw new Error("checkout did not redirect to payment page");
  return match[0];
}

export async function loginAdmin(page: Page) {
  const password = process.env.ADMIN_PASSWORD ?? "e2e-admin-password";
  await page.goto("/admin");
  await page.locator("#admin-password").fill(password);
  await page.getByRole("button", { name: /Iniciar sesión|Log in/i }).click();
  await expect(page).toHaveURL(/\/admin\/orders$/);
  await expect(page.getByRole("heading", { name: /Pedidos|Orders/i })).toBeVisible();
}

export const storeWhatsAppDigits = "18095551234";
