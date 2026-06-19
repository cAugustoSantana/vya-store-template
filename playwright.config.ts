import { defineConfig, devices } from "@playwright/test";
import { loadEnvFile } from "./e2e/helpers";

loadEnvFile(".env.test.local");
loadEnvFile(".env.local");

process.env.RATE_LIMIT_TEST ??= "1";
const fullStack = Boolean(process.env.DATABASE_URL?.trim());
if (fullStack) {
  process.env.E2E_STACK = "1";
}

const baseURL = fullStack ? "http://localhost:3000" : "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: fullStack ? "npm start" : "npm run dev",
    url: fullStack ? "http://localhost:3000/api/health" : "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      ...process.env,
      RATE_LIMIT_TEST: process.env.RATE_LIMIT_TEST ?? "1",
    },
  },
});
