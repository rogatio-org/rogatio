import { configDefaults, defineConfig } from "vitest/config";

// Las pruebas de e2e/ son de Playwright: Vitest no las corre.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
