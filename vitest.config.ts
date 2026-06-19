import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["src/test/setup.ts", "api/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}", "api/**/*.test.ts", "shared/**/*.test.ts"],
      coverage: {
        include: ["src/lib/**", "api/lib/**"],
      },
    },
  }),
);
