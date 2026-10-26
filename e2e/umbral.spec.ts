import { expect, test } from "@playwright/test";
import { RUTA_PETICION, firmarConMuestra, reiniciarSemilla } from "./ayuda";

test.beforeEach(reiniciarSemilla);
test.afterAll(reiniciarSemilla);

test("la firma 50 alcanza el umbral y genera el escrito simulado", async ({
  page,
}) => {
  await page.goto(RUTA_PETICION);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "49",
  );
  await expect(
    page.getByText("Pendiente: aún no se alcanza el umbral."),
  ).toBeVisible();

  await firmarConMuestra(page);
  await expect(page).toHaveURL(/\/comprobante\//);

  await page.goto(RUTA_PETICION);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "50",
  );
  await expect(
    page.getByRole("heading", { name: "Umbral alcanzado" }),
  ).toBeVisible();
  await expect(page.getByText("Escrito del Art. 8 generado.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Firmar esta petición" }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: "Ver escrito del Art. 8" }).click();
  await expect(
    page.getByText("SIMULACIÓN – NO ENVIADO").filter({ visible: true }).first(),
  ).toBeVisible();
});

// La demo no genera un PDF: el escrito se imprime o se guarda como PDF desde el navegador.
test.fixme("el PDF descargado del escrito lleva la marca de simulación", async () => {});
