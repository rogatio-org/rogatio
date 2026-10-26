// Lecturas de la base para las páginas públicas. Solo servidor.
// Quien llama desde una página debe hacer antes `await connection()` para no tocar la base en el build.
import { count, desc, eq } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import { envios, firmas, jurisdicciones, peticiones, raices } from "@/db/esquema";
import { aHex, raiz as calcularRaiz } from "./merkle";
import { peticionDemo, type PeticionDemo } from "./peticion-demo";

/** Petición por slug, con conteo, última raíz y último envío. Misma forma que el fixture. */
export async function obtenerPeticion(
  slug: string,
  db: BaseDeDatos = obtenerDb(),
): Promise<PeticionDemo | null> {
  const [fila] = await db
    .select({ peticion: peticiones, jurisdiccion: jurisdicciones })
    .from(peticiones)
    .innerJoin(jurisdicciones, eq(jurisdicciones.id, peticiones.jurisdiccionId))
    .where(eq(peticiones.slug, slug));
  if (!fila) return null;
  const { peticion, jurisdiccion } = fila;

  const [[{ firmas: total }], [ultimaRaiz], [ultimoEnvio]] = await Promise.all([
    db.select({ firmas: count() }).from(firmas).where(eq(firmas.peticionId, peticion.id)),
    db
      .select()
      .from(raices)
      .where(eq(raices.peticionId, peticion.id))
      .orderBy(desc(raices.tamano))
      .limit(1),
    db
      .select()
      .from(envios)
      .where(eq(envios.peticionId, peticion.id))
      .orderBy(desc(envios.creadoEn))
      .limit(1),
  ]);

  // Autoridad y ubicación aún no están en el esquema: salen del fixture para la demo.
  const esDemo = slug === peticionDemo.peticion.id;

  return {
    peticion: {
      id: peticion.slug,
      titulo: peticion.titulo,
      texto: peticion.texto,
      categoria: peticion.categoria,
      jurisdiccion: {
        nivel: jurisdiccion.nivel,
        codigo: jurisdiccion.codigo,
        nombre: jurisdiccion.nombre,
      },
      autoridad: esDemo ? peticionDemo.peticion.autoridad : jurisdiccion.nombre,
      ubicacion: esDemo ? peticionDemo.peticion.ubicacion : jurisdiccion.nombre,
      creada_en: peticion.creadaEn.toISOString(),
      estado: peticion.estado,
    },
    conteo: { firmas: total, umbral: peticion.umbral },
    raiz: ultimaRaiz
      ? {
          hash: aHex(ultimaRaiz.raiz),
          tamano_arbol: ultimaRaiz.tamano,
          publicada_en: ultimaRaiz.creadaEn.toISOString(),
        }
      : {
          // Árbol vacío (RFC 6962): SHA-256 de la cadena vacía.
          hash: aHex(await calcularRaiz([])),
          tamano_arbol: 0,
          publicada_en: peticion.creadaEn.toISOString(),
        },
    envio: {
      estado: ultimoEnvio?.estado ?? "pendiente",
      simulado: true,
      enviado_en: ultimoEnvio?.enviadoEn?.toISOString() ?? null,
      acuse_hash: ultimoEnvio?.hashAcuse ? aHex(ultimoEnvio.hashAcuse) : null,
    },
  };
}
