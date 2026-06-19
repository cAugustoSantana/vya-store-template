import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    watch: {
      ignored: ["**/playwright-report/**", "**/test-results/**"],
    },
    proxy: {
      // When using `dev:vite` (port 5173), API calls proxy to vercel dev on 3000
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});
