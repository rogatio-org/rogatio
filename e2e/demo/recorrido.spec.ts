import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Tiempos de cada escena en milisegundos. `comunicacion` ajusta aquí el ritmo del video.
const PAUSAS = {
  inicio: 3500,
  peticion: 3000,
  desglose: 3500,
  aviso: 3000,
  credencial: 2500,
  datosLeidos: 3000,
  confirmar: 3000,
  comprobante: 4500,
  verificar: 2500,
  verificado: 4500,
  umbral: 5000,
  escrito: 3000,
  marca: 5500,
} as const;

type Escena = keyof typeof PAUSAS;

const CAPTURAS = "test-results/demo/capturas";
const SLUG = "peticion-demo";

async function pausa(page: Page, escena: Escena) {
  await page.waitForTimeout(PAUSAS[escena]);
}

async function captura(page: Page, nombre: string) {
  await page.screenshot({ path: `${CAPTURAS}/${nombre}.png` });
}

async function desplazar(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "smooth" }), y);
  await page.waitForTimeout(800);
}

// Si una pantalla aún no existe, la escena se salta con un aviso.
async function existe(page: Page, ruta: string) {
  const respuesta = await page.request.get(ruta);
  if (respuesta.ok()) return true;
  console.warn(`Aviso: ${ruta} respondió ${respuesta.status()}; se salta la escena.`);
  return false;
}

test.beforeAll(() => {
  mkdirSync(CAPTURAS, { recursive: true });
  // Reinicia la semilla: la firma en vivo es la número 50.
  execSync("npm run db:seed", { stdio: "inherit" });
});

test("recorrido de la demo", async ({ page }) => {
  // 1. Inicio.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Rogatio" })).toBeVisible();
  await pausa(page, "inicio");
  await captura(page, "01-inicio");

  // 2. Petición con 49 de 50 y desglose por distrito.
  await page.getByRole("link", { name: "Ver la petición de ejemplo" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "49");
  await pausa(page, "peticion");
  await captura(page, "02-peticion");
  const desglose = page.getByText(/Distrito/).first();
  if (await desglose.count()) {
    await desglose.scrollIntoViewIfNeeded();
    await desplazar(page, await page.evaluate(() => document.body.scrollHeight));
    await pausa(page, "desglose");
    await captura(page, "03-desglose");
    await desplazar(page, 0);
  } else {
    console.warn("Aviso: no hay desglose por distrito; se salta la escena.");
  }

  // 3. Firmar con la credencial de muestra.
  await page.getByRole("link", { name: "Firmar esta petición" }).click();
  await expect(page.getByRole("heading", { name: "Aviso de privacidad" })).toBeVisible();
  await pausa(page, "aviso");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Acepto y continúo" }).click();
  await expect(page.getByRole("heading", { name: "Tu credencial para votar" })).toBeVisible();
  await pausa(page, "credencial");
  await page.getByRole("button", { name: "Leer credencial (simulado)" }).click();
  await desplazar(page, 700);
  await pausa(page, "datosLeidos");
  await captura(page, "04-credencial");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Confirma y firma" })).toBeVisible();
  await pausa(page, "confirmar");
  await page.getByRole("button", { name: "Firmar la petición" }).click();

  // 4. Comprobante de la firma 50.
  await expect(page).toHaveURL(/\/comprobante\//);
  await expect(page.getByText("Número de firma")).toBeVisible();
  await pausa(page, "comprobante");
  await captura(page, "05-comprobante");
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar comprobante" }).click(),
  ]);
  const archivo = test.info().outputPath("comprobante.json");
  await descarga.saveAs(archivo);

  // 5. Verificar el comprobante.
  await page.getByRole("link", { name: "Verificar un comprobante" }).click();
  await expect(page.getByRole("heading", { name: "Verificar un comprobante" })).toBeVisible();
  await pausa(page, "verificar");
  await page.getByLabel("Sube tu comprobante (.json)").setInputFiles(archivo);
  await page.getByRole("button", { name: "Verificar" }).click();
  const valido = page.getByRole("heading", { name: "Válido" });
  await expect(valido).toBeVisible();
  await desplazar(page, await page.evaluate(() => document.body.scrollHeight));
  await pausa(page, "verificado");
  await captura(page, "06-verificado");

  // 6. Petición con 50 de 50 y umbral alcanzado.
  await page.goto(`/peticion/${SLUG}`);
  await expect(page.getByRole("heading", { name: "Umbral alcanzado" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await pausa(page, "umbral");
  await captura(page, "07-umbral");

  // 7. Escrito del Art. 8 con la marca de simulación.
  if (await existe(page, `/peticion/${SLUG}/escrito`)) {
    await page.getByRole("link", { name: "Ver escrito del Art. 8" }).click();
    const marca = page.getByText("SIMULACIÓN – NO ENVIADO").filter({ visible: true }).first();
    await expect(marca).toBeVisible();
    await marca.scrollIntoViewIfNeeded();
    await pausa(page, "escrito");
    await captura(page, "08-escrito");
    await desplazar(page, 600);
    await pausa(page, "marca");
  }
});
