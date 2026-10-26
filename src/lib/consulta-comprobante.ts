// Lectura del comprobante de una firma. Solo servidor.
// Quien llama desde una página debe hacer antes `await connection()`.
import { and, asc, eq, gte } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import { firmas, peticiones, raices } from "@/db/esquema";
import { crearComprobante, leerIdComprobante, type Comprobante } from "./comprobante";
import { pruebaDeInclusion } from "./merkle";
import { hojasDePeticion } from "./registro";

export type ComprobanteConContexto = {
  comprobante: Comprobante;
  tituloPeticion: string;
  firmadaEn: string;
  raizPublicadaEn: string;
};

/**
 * Comprobante de la firma `<slug>-<secuencia>`, con la raíz de su momento:
 * la raíz publicada de menor tamaño que ya incluye la firma.
 */
export async function obtenerComprobante(
  id: string,
  db: BaseDeDatos = obtenerDb(),
): Promise<ComprobanteConContexto | null> {
  const ref = leerIdComprobante(id);
  if (!ref) return null;

  const [fila] = await db
    .select({ peticion: peticiones, firma: firmas })
    .from(firmas)
    .innerJoin(peticiones, eq(peticiones.id, firmas.peticionId))
    .where(and(eq(peticiones.slug, ref.slug), eq(firmas.secuencia, ref.secuencia)));
  if (!fila) return null;
  const { peticion, firma } = fila;

  const [raizDeSuMomento] = await db
    .select()
    .from(raices)
    .where(and(eq(raices.peticionId, peticion.id), gte(raices.tamano, firma.secuencia)))
    .orderBy(asc(raices.tamano))
    .limit(1);
  if (!raizDeSuMomento) return null;

  const hojas = (await hojasDePeticion(db, peticion.id)).slice(0, raizDeSuMomento.tamano);
  if (hojas.length !== raizDeSuMomento.tamano) {
    throw new Error("Registro inconsistente: faltan hojas para la raíz guardada");
  }
  const prueba = await pruebaDeInclusion(firma.secuencia - 1, hojas);

  return {
    comprobante: crearComprobante({
      peticion: peticion.slug,
      secuencia: firma.secuencia,
      hoja: new Uint8Array(firma.hoja),
      tamano: raizDeSuMomento.tamano,
      raiz: new Uint8Array(raizDeSuMomento.raiz),
      prueba,
    }),
    tituloPeticion: peticion.titulo,
    firmadaEn: firma.creadaEn.toISOString(),
    raizPublicadaEn: raizDeSuMomento.creadaEn.toISOString(),
  };
}
