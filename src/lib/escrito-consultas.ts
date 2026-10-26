// Lecturas de la base para el escrito del Art. 8. Solo servidor; hacer antes `await connection()`.
import { and, asc, count, eq } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import {
  firmas,
  jurisdicciones,
  personas,
  peticiones,
  seccionesElectorales,
} from "@/db/esquema";
import type { DistritoFirmantes } from "./escrito-art8";

/** Firmantes por distrito local, para las copias del escrito. Solo cuenta; no lee nombres. */
export async function firmantesPorDistritoLocal(
  slug: string,
  db: BaseDeDatos = obtenerDb(),
): Promise<DistritoFirmantes[]> {
  return db
    .select({ nombre: jurisdicciones.nombre, firmantes: count(firmas.id) })
    .from(firmas)
    .innerJoin(peticiones, eq(peticiones.id, firmas.peticionId))
    .innerJoin(personas, eq(personas.id, firmas.personaId))
    .innerJoin(
      seccionesElectorales,
      and(
        eq(seccionesElectorales.entidad, personas.entidad),
        eq(seccionesElectorales.seccion, personas.seccion),
      ),
    )
    .innerJoin(jurisdicciones, eq(jurisdicciones.id, seccionesElectorales.distritoLocalId))
    .where(eq(peticiones.slug, slug))
    .groupBy(jurisdicciones.id, jurisdicciones.codigo, jurisdicciones.nombre)
    .orderBy(asc(jurisdicciones.codigo));
}
