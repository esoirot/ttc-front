import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit tests only — Stryker must not run the Storybook browser project
// defined in vitest.config.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["e2e/**", "node_modules/**", ".stryker-tmp/**"],
    env: {
      VITE_API_URL: "http://localhost:3000/graphql",
    },
  },
});
