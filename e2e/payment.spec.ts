import path from "path";
import {
  test,
  expect,
  hasE2eDatabase,
  hasE2eBlob,
  completeCheckout,
  storeWhatsAppDigits,
} from "./fixtures";
import { writeProofPng } from "./helpers";

test.beforeEach(({ }, testInfo) => {
  if (!hasE2eDatabase()) testInfo.skip();
});

test.describe.configure({ mode: "serial" });

let displayId = "";

test("payment page survives reload with bank details from API", async ({ page }) => {
  displayId = await completeCheckout(page);
  await expect(page.getByText("1234567890")).toBeVisible();
  await page.reload();
  await expect(page.getByText(/MITIENDA-/i)).toBeVisible();
  await expect(page.getByText("1234567890")).toBeVisible();
});

test("whatsapp proof records method", async ({ page }) => {
  await page.goto(`/order/payment/${displayId}`);
  await page.evaluate(() => {
    (window as Window & { __opened?: string[] }).__opened = [];
    window.open = (url) => {
      (window as Window & { __opened?: string[] }).__opened!.push(String(url));
      return null;
    };
  });

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/proof-method") && r.ok()),
    page.getByRole("button", { name: /WhatsApp/i }).click(),
  ]);

  expect(response.ok()).toBeTruthy();
  const opened = await page.evaluate(() => (window as Window & { __opened?: string[] }).__opened);
  expect(opened?.[0]).toContain(`wa.me/${storeWhatsAppDigits}`);
  expect(opened?.[0]).toContain(encodeURIComponent(displayId));
});

test("upload png proof updates payment page", async ({ page }, testInfo) => {
  if (!hasE2eBlob()) {
    testInfo.skip(true, "BLOB_READ_WRITE_TOKEN not configured");
  }

  const proofPath = path.join(import.meta.dirname, "fixtures", "proof.png");
  writeProofPng(proofPath);

  await page.goto(`/order/payment/${displayId}`);
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(proofPath);

  await expect(page.getByText(/Comprobante enviado|Proof submitted/i)).toBeVisible({
    timeout: 15_000,
  });
});

test("rejects non-image proof upload", async ({ page }) => {
  await page.goto(`/order/payment/${displayId}`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByText(/PNG|JPEG/i).first()).toBeVisible();
  await expect(page.getByText(/Comprobante enviado|Proof submitted/i)).not.toBeVisible();
});
