import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { RUTA_PETICION, firmarConMuestra, reiniciarSemilla } from "./ayuda";

test.beforeAll(reiniciarSemilla);
test.afterAll(reiniciarSemilla);

let comprobante: string;
let raizPublicada: string;

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await firmarConMuestra(page);
  await expect(page).toHaveURL(/\/comprobante\//);
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar comprobante" }).click(),
  ]);
  comprobante = readFileSync((await descarga.path())!, "utf8");
  await page.goto(RUTA_PETICION);
  raizPublicada = (await page
    .getByText("Raíz del registro")
    .locator("xpath=..")
    .locator("dd")
    .textContent())!.trim();
  await page.close();
});

async function verificar(page: Page, texto: string, raiz = "") {
  await page.goto("/verificar");
  await page.getByLabel("O pega su contenido").fill(texto);
  await page.getByLabel("Raíz publicada en la petición (opcional)").fill(raiz);
  // A partir de aquí no se permite ninguna llamada al servidor.
  await page.route("**/*", (ruta) => ruta.abort());
  await page.getByRole("button", { name: "Verificar" }).click();
}

test("un comprobante íntegro es válido y coincide con la raíz publicada", async ({
  page,
}) => {
  await verificar(page, comprobante, raizPublicada);
  await expect(page.getByRole("heading", { name: "Válido" })).toBeVisible();
  await expect(
    page.getByText("Esa raíz coincide con la que pegaste."),
  ).toBeVisible();
});

test("un comprobante con la hoja alterada no es válido", async ({ page }) => {
  const datos = JSON.parse(comprobante);
  const hoja: string = datos.hoja;
  datos.hoja = (hoja[0] === "0" ? "1" : "0") + hoja.slice(1);
  await verificar(page, JSON.stringify(datos));
  await expect(page.getByRole("heading", { name: "No válido" })).toBeVisible();
});
