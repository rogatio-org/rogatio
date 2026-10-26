import { expect, test } from "@playwright/test";
import { conteoActual, firmarConMuestra, reiniciarSemilla } from "./ayuda";

test.beforeAll(reiniciarSemilla);

test("una sección de otra alcaldía se rechaza y el conteo no cambia", async ({
  page,
}) => {
  const antes = await conteoActual(page);
  await firmarConMuestra(page, "otra-alcaldia");
  await expect(
    page.getByRole("heading", { name: "Tu sección no pertenece a Cuauhtémoc" }),
  ).toBeVisible();
  expect(await conteoActual(page)).toBe(antes);
});
