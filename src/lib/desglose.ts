// Firmas por distrito federal y local. Solo conteos: nunca nombres ni seudónimos.
import { and, count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { obtenerDb, type BaseDeDatos } from "../db";
import { firmas, jurisdicciones, peticiones, personas, seccionesElectorales } from "../db/esquema";

export type FirmasDistrito = { codigo: string; nombre: string; firmas: number };

export type DesglosePorDistrito = {
  federales: FirmasDistrito[];
  locales: FirmasDistrito[];
  // Firmas cuya sección no está en secciones_electorales.
  sinDistrito: number;
};

type Distrito = { codigo: string; nombre: string };

export type FilaDesglose = {
  federal: Distrito | null;
  local: Distrito | null;
  firmas: number;
};

function sumar(mapa: Map<string, FirmasDistrito>, distrito: Distrito, firmas: number) {
  const actual = mapa.get(distrito.codigo);
  if (actual) actual.firmas += firmas;
  else mapa.set(distrito.codigo, { ...distrito, firmas });
}

function ordenar(mapa: Map<string, FirmasDistrito>) {
  return [...mapa.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
}

/** Agrupa filas (distrito federal, distrito local, firmas) en las dos listas. */
export function agruparPorDistrito(filas: FilaDesglose[]): DesglosePorDistrito {
  const federales = new Map<string, FirmasDistrito>();
  const locales = new Map<string, FirmasDistrito>();
  let sinDistrito = 0;
  for (const { federal, local, firmas } of filas) {
    if (!federal || !local) {
      sinDistrito += firmas;
      continue;
    }
    sumar(federales, federal, firmas);
    sumar(locales, local, firmas);
  }
  return { federales: ordenar(federales), locales: ordenar(locales), sinDistrito };
}

/** Número del distrito a partir de su código, p. ej. 'DL-09-12' → 12. */
export function numeroDeDistrito(codigo: string): number | null {
  const numero = Number(codigo.split("-").at(-1));
  return Number.isInteger(numero) ? numero : null;
}

/** Desglose por distrito de las firmas de una petición, por slug. */
export async function obtenerDesglosePorDistrito(
  slug: string,
  db: BaseDeDatos = obtenerDb(),
): Promise<DesglosePorDistrito> {
  const df = alias(jurisdicciones, "df");
  const dl = alias(jurisdicciones, "dl");
  const filas = await db
    .select({
      dfCodigo: df.codigo,
      dfNombre: df.nombre,
      dlCodigo: dl.codigo,
      dlNombre: dl.nombre,
      firmas: count(),
    })
    .from(firmas)
    .innerJoin(peticiones, eq(peticiones.id, firmas.peticionId))
    .innerJoin(personas, eq(personas.id, firmas.personaId))
    .leftJoin(
      seccionesElectorales,
      and(
        eq(seccionesElectorales.entidad, personas.entidad),
        eq(seccionesElectorales.seccion, personas.seccion),
      ),
    )
    .leftJoin(df, eq(df.id, seccionesElectorales.distritoFederalId))
    .leftJoin(dl, eq(dl.id, seccionesElectorales.distritoLocalId))
    .where(eq(peticiones.slug, slug))
    .groupBy(df.codigo, df.nombre, dl.codigo, dl.nombre);

  return agruparPorDistrito(
    filas.map((f) => ({
      federal: f.dfCodigo && f.dfNombre ? { codigo: f.dfCodigo, nombre: f.dfNombre } : null,
      local: f.dlCodigo && f.dlNombre ? { codigo: f.dlCodigo, nombre: f.dlNombre } : null,
      firmas: f.firmas,
    })),
  );
}
