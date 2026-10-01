import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { unitTest } from "./vitest.unit";

// Unit tests only — Stryker must not run the Storybook browser project
// defined in vitest.config.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: unitTest,
});
