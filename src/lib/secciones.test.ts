import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { cerrarDb, obtenerDb } from "@/db";
import { jurisdicciones } from "@/db/esquema";
import { seccionEsElegible } from "./secciones";

try {
  process.loadEnvFile(".env.local");
} catch {}

// Necesita la base con la semilla (npm run db:seed). Sin DATABASE_URL, como en CI, se omite.
describe.skipIf(!process.env.DATABASE_URL)("secciones", () => {
  let cuauhtemoc: number;
  let cdmx: number;
  let distritoLocal12: number;

  beforeAll(async () => {
    const db = obtenerDb();
    const id = async (nivel: "alcaldia" | "entidad" | "distrito_local", codigo: string) => {
      const [fila] = await db
        .select({ id: jurisdicciones.id })
        .from(jurisdicciones)
        .where(and(eq(jurisdicciones.nivel, nivel), eq(jurisdicciones.codigo, codigo)));
      return fila.id;
    };
    cuauhtemoc = await id("alcaldia", "09-015");
    cdmx = await id("entidad", "09");
    distritoLocal12 = await id("distrito_local", "DL-09-12");
  });

  afterAll(cerrarDb);

  it("acepta una sección de Cuauhtémoc", async () => {
    expect(await seccionEsElegible({ entidad: 9, seccion: 4523 }, cuauhtemoc)).toEqual({
      elegible: true,
    });
  });

  it("rechaza una sección de otra alcaldía y dice cuál es", async () => {
    expect(await seccionEsElegible({ entidad: 9, seccion: 4269 }, cuauhtemoc)).toEqual({
      elegible: false,
      alcaldia: "Benito Juárez",
    });
  });

  it("rechaza una sección que no existe", async () => {
    expect(await seccionEsElegible({ entidad: 9, seccion: 9999 }, cuauhtemoc)).toEqual({
      elegible: false,
      alcaldia: null,
    });
  });

  it("acepta peticiones de un ancestro o de un distrito de la sección", async () => {
    expect((await seccionEsElegible({ entidad: 9, seccion: 4269 }, cdmx)).elegible).toBe(true);
    expect((await seccionEsElegible({ entidad: 9, seccion: 4523 }, distritoLocal12)).elegible).toBe(
      true,
    );
    expect((await seccionEsElegible({ entidad: 9, seccion: 4269 }, distritoLocal12)).elegible).toBe(
      false,
    );
  });
});
