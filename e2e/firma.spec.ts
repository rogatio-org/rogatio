import { expect, test } from "@playwright/test";
import {
  RUTA_PETICION,
  conteoActual,
  firmarConMuestra,
  reiniciarSemilla,
} from "./ayuda";

// Al terminar, la semilla vuelve a 49 para no romper otras pruebas.
test.beforeEach(reiniciarSemilla);
test.afterAll(reiniciarSemilla);

test("firmar lleva al comprobante con secuencia, hoja y raíz", async ({
  page,
}) => {
  await page.goto(RUTA_PETICION);
  await page.getByRole("link", { name: "Firmar esta petición" }).click();
  await expect(page).toHaveURL("/firmar");
  await firmarConMuestra(page);

  await expect(page).toHaveURL(/\/comprobante\/[^/]+$/);
  await expect(page.getByText("Número de firma")).toBeVisible();
  await expect(page.getByText("50", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Hash de tu firma (hoja)")).toBeVisible();
  await expect(page.getByText("Raíz del registro")).toBeVisible();
});

test("firmar dos veces con la misma CURP no suma otra firma", async ({
  page,
}) => {
  await firmarConMuestra(page);
  await expect(page).toHaveURL(/\/comprobante\//);

  await firmarConMuestra(page);
  await expect(
    page.getByRole("heading", { name: "Ya firmaste esta petición" }),
  ).toBeVisible();
  expect(await conteoActual(page)).toBe("50");
});
