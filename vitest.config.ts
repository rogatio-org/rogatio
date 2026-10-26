import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Mismo alias que tsconfig.json.
// Las pruebas de e2e/ son de Playwright: Vitest no las corre.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
