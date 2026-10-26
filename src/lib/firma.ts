// Firma desde /firmar: valida, revisa la sección, guarda a la persona y registra la firma. Solo servidor.
// Nunca escribas en logs los datos de la persona (#55).
import { and, eq } from "drizzle-orm";
import { obtenerDb, type BaseDeDatos } from "@/db";
import { cifrar } from "@/db/cifrado";
import { envios, firmas, jurisdicciones, personas, peticiones } from "@/db/esquema";
import { curpHmac } from "@/db/seudonimo";
import { idComprobante } from "./comprobante";
import type { DatosFirma, EstadoFirma } from "./datos-firma";
import { registrarFirma } from "./registro";
import { seccionEsElegible } from "./secciones";

function llaves() {
  const hmac = process.env.ROGATIO_LLAVE_HMAC;
  const cifrado = Buffer.from(process.env.ROGATIO_LLAVE_CIFRADO ?? "", "hex");
  if (!hmac) throw new Error("Falta ROGATIO_LLAVE_HMAC");
  if (cifrado.length !== 32) throw new Error("ROGATIO_LLAVE_CIFRADO debe ser 32 bytes en hex");
  return { hmac, cifrado };
}

/**
 * Registra la firma de una persona ya validada en la petición `slug`.
 * Si la sección no es elegible, no escribe nada en la base.
 * Si la firma lleva la petición a su umbral, crea el envío simulado en estado "generado".
 */
export async function firmarPeticion(
  slug: string,
  datos: DatosFirma,
  db: BaseDeDatos = obtenerDb(),
): Promise<Exclude<EstadoFirma, { tipo: "inicial" | "invalido" | "error" }>> {
  const [fila] = await db
    .select({
      id: peticiones.id,
      estado: peticiones.estado,
      jurisdiccionId: peticiones.jurisdiccionId,
      jurisdiccion: jurisdicciones.nombre,
    })
    .from(peticiones)
    .innerJoin(jurisdicciones, eq(jurisdicciones.id, peticiones.jurisdiccionId))
    .where(eq(peticiones.slug, slug));
  if (!fila) return { tipo: "peticion_inexistente" };
  if (fila.estado !== "abierta" && fila.estado !== "umbral_alcanzado") {
    return { tipo: "peticion_cerrada" };
  }

  const elegibilidad = await seccionEsElegible(datos, fila.jurisdiccionId, db);
  if (!elegibilidad.elegible) {
    return {
      tipo: "fuera_de_jurisdiccion",
      seccion: datos.seccion,
      alcaldiaSeccion: elegibilidad.alcaldia,
      jurisdiccion: fila.jurisdiccion,
    };
  }

  const { hmac, cifrado } = llaves();
  const seudonimo = curpHmac(datos.curp, hmac);

  // Si ya firmó, no cambia nada de la persona.
  const previa = await firmaPrevia(db, fila.id, seudonimo);
  if (previa !== null) return { tipo: "ya_firmo", idComprobante: idComprobante(slug, previa) };

  const [persona] = await db
    .insert(personas)
    .values({
      curpHmac: seudonimo,
      nombreCifrado: cifrar(datos.nombre, cifrado),
      curpCifrada: cifrar(datos.curp, cifrado),
      entidad: datos.entidad,
      seccion: datos.seccion,
    })
    .onConflictDoUpdate({
      target: personas.curpHmac,
      set: {
        nombreCifrado: cifrar(datos.nombre, cifrado),
        curpCifrada: cifrar(datos.curp, cifrado),
        entidad: datos.entidad,
        seccion: datos.seccion,
        verificadoEn: new Date(),
      },
    })
    .returning({ id: personas.id });

  const resultado = await registrarFirma({ slug, personaId: persona.id }, db);
  if (!resultado.ok) {
    switch (resultado.motivo) {
      case "ya_firmo": {
        // Otra solicitud de la misma persona ganó la carrera.
        const secuencia = await firmaPrevia(db, fila.id, seudonimo);
        return { tipo: "ya_firmo", idComprobante: idComprobante(slug, secuencia ?? 1) };
      }
      case "peticion_cerrada":
        return { tipo: "peticion_cerrada" };
      default:
        return { tipo: "peticion_inexistente" };
    }
  }

  if (resultado.umbralAlcanzado) await generarEnvio(db, fila.id);

  return {
    tipo: "firmada",
    idComprobante: resultado.idComprobante,
    secuencia: resultado.secuencia,
    umbralAlcanzado: resultado.umbralAlcanzado,
  };
}

async function firmaPrevia(db: BaseDeDatos, peticionId: number, seudonimo: string) {
  const [fila] = await db
    .select({ secuencia: firmas.secuencia })
    .from(firmas)
    .innerJoin(personas, eq(personas.id, firmas.personaId))
    .where(and(eq(firmas.peticionId, peticionId), eq(personas.curpHmac, seudonimo)));
  return fila?.secuencia ?? null;
}

// Envío simulado: uno por petición. El PDF y su hash los genera la épica del escrito.
async function generarEnvio(db: BaseDeDatos, peticionId: number) {
  await db.transaction(async (tx) => {
    await tx
      .select({ id: peticiones.id })
      .from(peticiones)
      .where(eq(peticiones.id, peticionId))
      .for("update");
    const [existente] = await tx
      .select({ id: envios.id })
      .from(envios)
      .where(eq(envios.peticionId, peticionId))
      .limit(1);
    if (!existente) await tx.insert(envios).values({ peticionId, estado: "generado" });
  });
}
