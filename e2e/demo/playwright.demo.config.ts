import { defineConfig, devices } from "@playwright/test";

// Configuración solo para grabar el video de la demo (npm run demo:video).
// Graba contra la build de producción en el puerto 3200.
const PUERTO = 3200;

export default defineConfig({
  testDir: ".",
  outputDir: "../../test-results/demo",
  workers: 1,
  retries: 0,
  // El recorrido completo dura cerca de un minuto, más el arranque.
  timeout: 180_000,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    viewport: { width: 1280, height: 720 },
    video: { mode: "on", size: { width: 1280, height: 720 } },
    launchOptions: { slowMo: 300 },
    acceptDownloads: true,
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO}`,
    cwd: "../..",
    port: PUERTO,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
