import { defineConfig, devices } from "@playwright/test";

// Si PLAYWRIGHT_BASE_URL existe, las pruebas corren contra ese servidor y no se levanta uno local.
const urlExterna = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "e2e",
  // La base de datos es compartida: una prueba a la vez.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: urlExterna ?? "http://localhost:3000",
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: urlExterna
    ? undefined
    : {
        command: "npm run build && npm run start",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
