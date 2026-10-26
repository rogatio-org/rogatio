import { expect, test } from "@playwright/test";

test("la portada enlaza a la petición de ejemplo", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Rogatio" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver la petición de ejemplo" }).click();
  await expect(page).toHaveURL("/peticion/peticion-demo");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
