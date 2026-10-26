// Elegibilidad por sección (docs/arquitectura/01-jurisdicciones.md, regla de elegibilidad). Solo servidor.
import { and, eq, sql } from "drizzle-orm";
import { obtenerDb } from "@/db";
import { jurisdicciones, seccionesElectorales } from "@/db/esquema";
import type { Ejecutor } from "./registro";

export type Elegibilidad =
  | { elegible: true }
  // alcaldia es null si la sección no existe en el catálogo.
  | { elegible: false; alcaldia: string | null };

/**
 * La sección es elegible si la jurisdicción de la petición es su alcaldía, uno de sus
 * distritos o un ancestro de alguno. Una sección que no está en el catálogo no es elegible.
 */
export async function seccionEsElegible(
  { entidad, seccion }: { entidad: number; seccion: number },
  jurisdiccionId: number,
  db: Ejecutor = obtenerDb(),
): Promise<Elegibilidad> {
  const [fila] = await db
    .select({
      alcaldiaId: seccionesElectorales.alcaldiaId,
      distritoFederalId: seccionesElectorales.distritoFederalId,
      distritoLocalId: seccionesElectorales.distritoLocalId,
      alcaldia: jurisdicciones.nombre,
    })
    .from(seccionesElectorales)
    .innerJoin(jurisdicciones, eq(jurisdicciones.id, seccionesElectorales.alcaldiaId))
    .where(and(eq(seccionesElectorales.entidad, entidad), eq(seccionesElectorales.seccion, seccion)));
  if (!fila) return { elegible: false, alcaldia: null };

  // Sube por padre_id desde los tres nodos de la sección.
  const { rows } = await db.execute<{ id: string }>(sql`
    with recursive ancestros(id, padre_id) as (
      select id, padre_id from ${jurisdicciones}
      where id in (${fila.alcaldiaId}, ${fila.distritoFederalId}, ${fila.distritoLocalId})
      union
      select j.id, j.padre_id from ${jurisdicciones} j join ancestros a on j.id = a.padre_id
    )
    select id from ancestros where id = ${jurisdiccionId}
  `);
  return rows.length > 0 ? { elegible: true } : { elegible: false, alcaldia: fila.alcaldia };
}
