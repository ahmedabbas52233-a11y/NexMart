import { defineConfig } from "vitest/config";
import path from "path";

// WHY no @vitejs/plugin-react:
// Using defineConfig from "vitest/config" with @vitejs/plugin-react causes
// a PluginOption type mismatch (vitest bundles its own vite copy).
// Instead, we configure esbuild directly with jsx:"automatic" which tells
// esbuild to use React 17+ automatic runtime — no `import React` needed
// in component files, same behaviour as the plugin provided.

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
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
