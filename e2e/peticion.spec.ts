import { expect, test } from "@playwright/test";
import { RUTA_PETICION, peticion, reiniciarSemilla } from "./ayuda";

test.beforeAll(reiniciarSemilla);

test("la portada lleva a la petición de ejemplo", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Rogatio" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver la petición de ejemplo" }).click();
  await expect(page).toHaveURL(RUTA_PETICION);
});

test("la petición muestra los datos del fixture y 49 de 50 firmas", async ({
  page,
}) => {
  await page.goto(RUTA_PETICION);
  await expect(
    page.getByRole("heading", { level: 1, name: peticion.titulo }),
  ).toBeVisible();
  await expect(
    page.getByText(peticion.autoridad, { exact: false }).first(),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "49",
  );
  await expect(page.getByText("de 50 firmas")).toBeVisible();
  await page.getByRole("link", { name: "Firmar esta petición" }).click();
  await expect(page).toHaveURL("/firmar");
});

for (const ruta of [
  "/",
  RUTA_PETICION,
  "/firmar",
  "/verificar",
  "/no-existe",
]) {
  test(`la franja DEMO se ve en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByText("DEMO: datos simulados")).toBeVisible();
  });
}

test("una petición que no existe muestra la página 404", async ({ page }) => {
  // La página se transmite en streaming: el estado HTTP ya salió como 200, se comprueba el contenido.
  await page.goto("/peticion/no-existe");
  await expect(
    page.getByRole("heading", { name: "No encontramos esta página" }),
  ).toBeVisible();
});
