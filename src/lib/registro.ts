// Registro de solo adición de firmas (docs/transparencia.md, secc. 2.2). Solo servidor.
import { and, asc, count, eq } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import { firmas, personas, peticiones, raices } from "@/db/esquema";
import { hojaDeFirma, idComprobante } from "./comprobante";
import type { EstadoPeticion } from "./estado-peticion";
import { raiz as calcularRaiz, type Hash } from "./merkle";

type Transaccion = Parameters<Parameters<BaseDeDatos["transaction"]>[0]>[0];
export type Ejecutor = BaseDeDatos | Transaccion;

/** Hojas de la petición en orden de secuencia. */
export async function hojasDePeticion(db: Ejecutor, peticionId: number): Promise<Hash[]> {
  const filas = await db
    .select({ hoja: firmas.hoja })
    .from(firmas)
    .where(eq(firmas.peticionId, peticionId))
    .orderBy(asc(firmas.secuencia));
  return filas.map((f) => new Uint8Array(f.hoja));
}

/** Calcula la raíz de todas las hojas y la guarda en `raices` (una fila por tamaño). */
export async function guardarRaiz(
  db: Ejecutor,
  peticionId: number,
): Promise<{ tamano: number; raiz: Hash }> {
  const hojas = await hojasDePeticion(db, peticionId);
  const raiz = await calcularRaiz(hojas);
  await db
    .insert(raices)
    .values({ peticionId, tamano: hojas.length, raiz: Buffer.from(raiz) })
    .onConflictDoNothing();
  return { tamano: hojas.length, raiz };
}

export type ResultadoFirma =
  | {
      ok: true;
      secuencia: number;
      hoja: Hash;
      tamano: number;
      raiz: Hash;
      idComprobante: string;
      umbralAlcanzado: boolean;
    }
  | { ok: false; motivo: "peticion_cerrada"; estado: EstadoPeticion }
  | { ok: false; motivo: "peticion_inexistente" | "persona_inexistente" | "ya_firmo" };

/**
 * Agrega la firma de una persona ya verificada, calcula la raíz nueva y la guarda,
 * todo en una transacción. Si llega al umbral, la petición pasa a "umbral_alcanzado"
 * y deja de recibir firmas.
 * La elegibilidad por sección la revisa quien llama.
 */
export async function registrarFirma(
  { slug, personaId }: { slug: string; personaId: number },
  db: BaseDeDatos = obtenerDb(),
): Promise<ResultadoFirma> {
  return db.transaction(async (tx) => {
    // El bloqueo de la petición ordena las firmas concurrentes.
    const [peticion] = await tx
      .select()
      .from(peticiones)
      .where(eq(peticiones.slug, slug))
      .for("update");
    if (!peticion) return { ok: false, motivo: "peticion_inexistente" } as const;
    if (peticion.estado !== "abierta") {
      return { ok: false, motivo: "peticion_cerrada", estado: peticion.estado } as const;
    }

    const [persona] = await tx
      .select({ curpHmac: personas.curpHmac })
      .from(personas)
      .where(eq(personas.id, personaId));
    if (!persona) return { ok: false, motivo: "persona_inexistente" } as const;

    const [previa] = await tx
      .select({ id: firmas.id })
      .from(firmas)
      .where(and(eq(firmas.peticionId, peticion.id), eq(firmas.personaId, personaId)));
    if (previa) return { ok: false, motivo: "ya_firmo" } as const;

    const [{ total }] = await tx
      .select({ total: count() })
      .from(firmas)
      .where(eq(firmas.peticionId, peticion.id));
    const secuencia = total + 1;
    const hoja = await hojaDeFirma({ slug, secuencia, curpHmac: persona.curpHmac });
    await tx
      .insert(firmas)
      .values({ peticionId: peticion.id, personaId, secuencia, hoja: Buffer.from(hoja) });

    const { tamano, raiz } = await guardarRaiz(tx, peticion.id);
    const umbralAlcanzado = tamano >= peticion.umbral;
    if (umbralAlcanzado && peticion.estado === "abierta") {
      await tx
        .update(peticiones)
        .set({ estado: "umbral_alcanzado" })
        .where(eq(peticiones.id, peticion.id));
    }

    return {
      ok: true,
      secuencia,
      hoja,
      tamano,
      raiz,
      idComprobante: idComprobante(slug, secuencia),
      umbralAlcanzado,
    } as const;
  });
}
