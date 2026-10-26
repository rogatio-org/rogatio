// Anclaje de las raíces en OpenTimestamps (docs/transparencia.md, secc. 2.2). Solo servidor.
// Cada raíz nueva se envía a los calendarios. Unas horas después, los calendarios la incluyen
// en una transacción de Bitcoin y la prueba se actualiza con la atestación del bloque.
import { and, asc, eq, isNull, or } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import { peticiones, raices } from "@/db/esquema";
import { aHex } from "./merkle";
import {
  aplicar,
  atestaciones,
  escribirArchivoOts,
  leerArchivoOts,
  leerSello,
  unirSellos,
  type Sello,
} from "./opentimestamps";

const CALENDARIOS_PREDETERMINADOS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
  "https://a.pool.eternitywall.com",
];

// Las atestaciones pendientes apuntan al calendario de fondo, no al pool. Misma lista blanca
// que el cliente oficial de OpenTimestamps.
const DOMINIOS_CALENDARIO = [
  ".calendar.opentimestamps.org",
  ".calendar.eternitywall.com",
  ".calendar.catallaxy.com",
];

const CABECERAS = { Accept: "application/vnd.opentimestamps.v1", "User-Agent": "rogatio" };

/** Calendarios de ROGATIO_OTS_CALENDARIOS (separados por comas). Vacía, desactiva el anclaje. */
export function calendarios(): string[] {
  const valor = process.env.ROGATIO_OTS_CALENDARIOS;
  if (valor === undefined) return CALENDARIOS_PREDETERMINADOS;
  return valor
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** Solo se consultan calendarios https de la lista blanca o de la lista configurada. */
export function calendarioPermitido(uri: string, lista = calendarios()): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const configurados = lista.flatMap((c) => {
    try {
      return [new URL(c).hostname];
    } catch {
      return [];
    }
  });
  return (
    configurados.includes(url.hostname) ||
    DOMINIOS_CALENDARIO.some((dominio) => url.hostname.endsWith(dominio))
  );
}

/** Envía el digest a los calendarios y une sus respuestas. Null si ninguno responde. */
export async function sellar(
  digest: Uint8Array,
  lista = calendarios(),
  esperaMs = 10_000,
): Promise<Uint8Array | null> {
  const respuestas = await Promise.allSettled(
    lista.map(async (url) => {
      const r = await fetch(`${url}/digest`, {
        method: "POST",
        body: Buffer.from(digest),
        headers: CABECERAS,
        signal: AbortSignal.timeout(esperaMs),
      });
      if (!r.ok) throw new Error(`Calendario ${url}: HTTP ${r.status}`);
      return leerSello(new Uint8Array(await r.arrayBuffer()));
    }),
  );
  const sellos = respuestas.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (sellos.length === 0) return null;
  return escribirArchivoOts(digest, unirSellos(sellos));
}

/**
 * Pide a los calendarios la parte completa de cada atestación pendiente.
 * Solo consulta calendarios permitidos. Devuelve la prueba y el bloque más antiguo.
 */
export async function actualizar(
  ots: Uint8Array,
  lista = calendarios(),
  esperaMs = 5_000,
): Promise<{ ots: Uint8Array; bloqueBitcoin: number | null }> {
  const { digest, sello } = leerArchivoOts(ots);

  async function recorrer(nodo: Sello, mensaje: Uint8Array) {
    for (const atestacion of [...nodo.atestaciones]) {
      if (atestacion.tipo !== "pendiente" || !calendarioPermitido(atestacion.calendario, lista)) {
        continue;
      }
      try {
        const r = await fetch(`${atestacion.calendario}/timestamp/${aHex(mensaje)}`, {
          headers: CABECERAS,
          signal: AbortSignal.timeout(esperaMs),
        });
        // 404 mientras la transacción no se confirma.
        if (!r.ok) continue;
        const completo = leerSello(new Uint8Array(await r.arrayBuffer()));
        nodo.atestaciones = nodo.atestaciones.filter((a) => a !== atestacion);
        nodo.atestaciones.push(...completo.atestaciones);
        nodo.ramas.push(...completo.ramas);
      } catch {
        // Calendario caído o respuesta dañada: se intenta en la siguiente actualización.
      }
    }
    for (const { operacion, sello: hijo } of nodo.ramas) {
      await recorrer(hijo, await aplicar(operacion, mensaje));
    }
  }

  await recorrer(sello, digest);
  const alturas = (await atestaciones(sello, digest)).flatMap(({ atestacion }) =>
    atestacion.tipo === "bitcoin" ? [atestacion.altura] : [],
  );
  return {
    ots: escribirArchivoOts(digest, sello),
    bloqueBitcoin: alturas.length > 0 ? Math.min(...alturas) : null,
  };
}

type FilaRaiz = typeof raices.$inferSelect;

/** Sella la raíz si no tiene prueba; si la prueba está pendiente y `actualizarPendiente`, la actualiza. */
async function anclarFila(
  db: BaseDeDatos,
  fila: FilaRaiz,
  actualizarPendiente: boolean,
): Promise<FilaRaiz> {
  if (calendarios().length === 0) return fila;
  if (!fila.ots) {
    const ots = await sellar(new Uint8Array(fila.raiz));
    if (!ots) return fila;
    const [nueva] = await db
      .update(raices)
      .set({ ots: Buffer.from(ots) })
      .where(eq(raices.id, fila.id))
      .returning();
    // Sin fila si la raíz se borró mientras tanto (p. ej. al recargar la semilla).
    return nueva ?? fila;
  }
  if (fila.bloqueBitcoin === null && actualizarPendiente) {
    const { ots, bloqueBitcoin } = await actualizar(new Uint8Array(fila.ots));
    if (bloqueBitcoin === null) return fila;
    const [nueva] = await db
      .update(raices)
      .set({ ots: Buffer.from(ots), bloqueBitcoin })
      .where(eq(raices.id, fila.id))
      .returning();
    // Sin fila si la raíz se borró mientras tanto (p. ej. al recargar la semilla).
    return nueva ?? fila;
  }
  return fila;
}

/**
 * Sella las raíces sin prueba y actualiza las pendientes. Sin `slug`, recorre todas las peticiones.
 * Nunca lanza por un calendario caído: la raíz queda para la siguiente corrida.
 */
export async function anclarRaices(
  { slug, actualizarPendientes = true }: { slug?: string; actualizarPendientes?: boolean } = {},
  db: BaseDeDatos = obtenerDb(),
): Promise<{ revisadas: number; selladas: number; ancladas: number }> {
  const pendientes = or(isNull(raices.ots), isNull(raices.bloqueBitcoin));
  const filas = await db
    .select({ raiz: raices })
    .from(raices)
    .innerJoin(peticiones, eq(peticiones.id, raices.peticionId))
    .where(slug ? and(eq(peticiones.slug, slug), pendientes) : pendientes)
    .orderBy(asc(raices.id));

  const cuenta = { revisadas: filas.length, selladas: 0, ancladas: 0 };
  for (const { raiz: fila } of filas) {
    try {
      const nueva = await anclarFila(db, fila, actualizarPendientes);
      if (!fila.ots && nueva.ots) cuenta.selladas++;
      if (fila.bloqueBitcoin === null && nueva.bloqueBitcoin !== null) cuenta.ancladas++;
    } catch {
      console.error(`anclaje: no se pudo anclar la raíz ${fila.id}`);
    }
  }
  return cuenta;
}

/** Prueba .ots de la raíz de `tamano` firmas. La sella o actualiza si hace falta. */
export async function obtenerOts(
  slug: string,
  tamano: number,
  db: BaseDeDatos = obtenerDb(),
): Promise<{ ots: Uint8Array | null; bloqueBitcoin: number | null } | null> {
  const [fila] = await db
    .select({ raiz: raices })
    .from(raices)
    .innerJoin(peticiones, eq(peticiones.id, raices.peticionId))
    .where(and(eq(peticiones.slug, slug), eq(raices.tamano, tamano)));
  if (!fila) return null;
  let raiz = fila.raiz;
  try {
    raiz = await anclarFila(db, raiz, true);
  } catch {
    console.error(`anclaje: no se pudo anclar la raíz ${raiz.id}`);
  }
  return { ots: raiz.ots ? new Uint8Array(raiz.ots) : null, bloqueBitcoin: raiz.bloqueBitcoin };
}
