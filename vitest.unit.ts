import type { ViteUserConfig } from "vitest/config";

// Shared by the unit project in vitest.config.ts and by vitest.stryker.config.ts.
export const unitTest: NonNullable<ViteUserConfig["test"]> = {
  environment: "jsdom",
  setupFiles: ["./src/test/setup.ts"],
  exclude: ["e2e/**", "node_modules/**", ".stryker-tmp/**"],
  env: {
    VITE_API_URL: "http://localhost:3000/graphql",
  },
  // vmThreads builds the jsdom environment once per worker instead of once per
  // test file, while still giving each file its own module registry.
  pool: "vmThreads",
  deps: {
    optimizer: {
      // Pre-bundle heavy libraries so each file imports one file instead of
      // hundreds. Libraries that tests vi.mock() (react-router-dom, recharts,
      // @dnd-kit/core) must stay out of this list.
      client: {
        enabled: true,
        include: [
          "radix-ui",
          "lucide-react",
          "react-intl",
          "@tanstack/react-query",
          "@apollo/client",
          "@testing-library/react",
          "@dnd-kit/sortable",
          "cmdk",
          "sonner",
        ],
      },
    },
  },
};
