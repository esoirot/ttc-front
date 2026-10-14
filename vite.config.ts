import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Match the package name: pnpm folder names list peer deps
        // (`.pnpm/recharts@3_react-dom@19/…`), so a substring test on the
        // whole id would pull every React library into the "react" chunk.
        // Other packages are left to the bundler, so a library used by one
        // lazy page stays in that page's chunk.
        manualChunks(id: string) {
          if (!id.includes("node_modules/")) return;
          const pkg =
            id
              .split("node_modules/")
              .at(-1)
              ?.match(/^(@[^/]+\/)?[^/]+/)?.[0] ?? "";
          if (pkg.startsWith("@apollo/") || pkg === "graphql") return "apollo";
          if (
            [
              "react",
              "react-dom",
              "scheduler",
              "react-router",
              "react-router-dom",
            ].includes(pkg)
          )
            return "react";
          if (
            pkg.startsWith("@radix-ui/") ||
            ["cmdk", "vaul", "sonner"].includes(pkg)
          )
            return "ui";
          if (pkg.startsWith("@tanstack/")) return "query";
          if (pkg.startsWith("@dnd-kit/")) return "dnd";
        },
      },
    },
  },
});
