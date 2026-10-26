import { execSync } from "node:child_process";
import { expect, type Page } from "@playwright/test";
import demo from "../data/fixtures/peticion-demo.json";
import muestras from "../data/fixtures/credenciales-muestra.json";

export const peticion = demo.peticion;
export const RUTA_PETICION = `/peticion/${peticion.id}`;

// Deja la base como en la demo: 49 de 50 firmas.
export function reiniciarSemilla() {
  execSync("npm run db:seed", { stdio: "pipe" });
}

export function muestra(id: string) {
  const credencial = muestras.credenciales.find((c) => c.id === id);
  if (!credencial) throw new Error(`No existe la credencial de muestra ${id}`);
  return credencial;
}

// Recorre el formulario con una credencial de muestra (datos ficticios) y pulsa firmar.
export async function firmarConMuestra(page: Page, muestraId = "cuauhtemoc") {
  await page.goto("/firmar");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Acepto y continúo" }).click();
  await page.getByRole("radio", { name: muestra(muestraId).etiqueta }).check();
  await page
    .getByRole("button", { name: "Leer credencial (simulado)" })
    .click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirma y firma" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Firmar la petición" }).click();
}

export async function conteoActual(page: Page) {
  await page.goto(RUTA_PETICION);
  return page.getByRole("progressbar").getAttribute("aria-valuenow");
}
