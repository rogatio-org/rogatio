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

// La firma 50 cierra la petición: /firmar ya no muestra el formulario.
// Que la misma CURP no firme dos veces lo prueba src/lib/firma.test.ts.
test("tras la firma 50, /firmar muestra que la petición ya no recibe firmas", async ({
  page,
}) => {
  await firmarConMuestra(page);
  await expect(page).toHaveURL(/\/comprobante\//);

  await page.goto("/firmar");
  await expect(
    page.getByRole("heading", { name: "Esta petición ya alcanzó su umbral" }),
  ).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  expect(await conteoActual(page)).toBe("50");
});
