import { defineConfig } from "vitest/config";
import path from "path";

// WHY no @vitejs/plugin-react here:
// When tsc --noEmit type-checks vitest.config.ts it uses the standalone
// vite package's types, but defineConfig from "vitest/config" uses
// vitest's bundled vite copy — two different PluginOption types clash.
// For testing purposes React JSX transform is handled by vitest's built-in
// esbuild transform (which supports JSX natively), so the plugin is
// not needed in the test config.

export default defineConfig({
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
