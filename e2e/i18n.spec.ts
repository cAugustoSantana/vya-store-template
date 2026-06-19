import { test, expect, switchLocale, gotoStorefront } from "./fixtures";

test("home shows catalog with locale switcher", async ({ page }) => {
  await gotoStorefront(page);
  await expect(page.getByRole("button", { name: "EN" })).toBeVisible();
  await expect(page.getByText(/Camiseta|Basic T-shirt/)).toBeVisible();
});

test("locale switch updates storefront copy", async ({ page }) => {
  await gotoStorefront(page);
  await switchLocale(page, "EN");
  await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  await expect(page.getByText("Basic T-shirt")).toBeVisible();
  await switchLocale(page, "ES");
  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
});
