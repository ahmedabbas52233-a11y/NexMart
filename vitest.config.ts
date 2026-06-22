/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// WHY import from "vite" not "vitest/config":
// vitest bundles its own copy of vite. @vitejs/plugin-react uses the
// standalone vite package. When both are present, TypeScript sees two
// incompatible Plugin types and raises a PluginOption[] mismatch error.
// Using defineConfig from "vite" keeps both on the same type source.
// The /// <reference types="vitest" /> directive adds Vitest's `test`
// config property to Vite's UserConfig so the `test` block type-checks.

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: [
        "lib/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "app/api/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules",
        ".next",
        "prisma",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
