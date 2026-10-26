// Firmas por sección electoral para el mapa. Solo servidor.
import { count, eq, gte } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "../db";
import { firmas, peticiones, personas } from "../db/esquema";
import { MINIMO_ANONIMATO, filtrarAnonimato, type FirmasSeccion } from "./mapa-colores";

/** Firmas por sección de una petición, por slug. Solo secciones con 5 firmas o más. */
export async function obtenerFirmasPorSeccion(
  slug: string,
  db: BaseDeDatos = obtenerDb(),
): Promise<FirmasSeccion[]> {
  const filas = await db
    .select({ seccion: personas.seccion, firmas: count() })
    .from(firmas)
    .innerJoin(peticiones, eq(peticiones.id, firmas.peticionId))
    .innerJoin(personas, eq(personas.id, firmas.personaId))
    .where(eq(peticiones.slug, slug))
    .groupBy(personas.seccion)
    .having(gte(count(), MINIMO_ANONIMATO));
  return filtrarAnonimato(filas);
}
