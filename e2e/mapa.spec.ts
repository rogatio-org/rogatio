import { expect, test } from "@playwright/test";
import { RUTA_PETICION, reiniciarSemilla } from "./ayuda";

test.beforeAll(reiniciarSemilla);

test("el mapa pinta las secciones con 5 firmas o más", async ({ page }) => {
  await page.goto(RUTA_PETICION);
  const mapa = page.getByRole("region", { name: "Mapa de firmas por sección" });
  await expect(mapa.getByText(/Solo mostramos secciones con 5 firmas o más/)).toBeVisible();
  await expect(mapa.locator("path.leaflet-interactive").first()).toBeVisible();
  await mapa.getByText(/Ver secciones con color/).click();
  await expect(mapa.getByText("Sección 4542")).toBeVisible();
  await expect(mapa.getByText("Sección 4541")).toHaveCount(0);
});
