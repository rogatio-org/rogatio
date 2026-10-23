// Semilla y reinicio de la demo (2026-10-26). Idempotente. Solo datos ficticios.
// La semilla de secciones electorales de Cuauhtémoc es un issue aparte.
import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cerrarDb, obtenerDb } from "../src/db";
import {
  envios,
  firmas,
  jurisdicciones,
  personas,
  peticiones,
  raices,
} from "../src/db/esquema";
import { cifrar } from "../src/db/cifrado";
import { curpHmac } from "../src/db/seudonimo";
import demo from "../data/fixtures/peticion-demo.json";

try {
  process.loadEnvFile(".env.local");
} catch {}

const UMBRAL = 50;
const FIRMAS_PRECARGADAS = 49;
const ENTIDAD_CDMX = 9;
// Sección ficticia hasta que exista la semilla de secciones.
const SECCION_FICTICIA = 9999;
// La petición sale del mismo fixture que usa la UI.
const { id: SLUG, titulo: TITULO, texto: TEXTO, categoria: CATEGORIA } = demo.peticion;

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta ${nombre}`);
  return valor;
}

const llaveHmac = requerida("ROGATIO_LLAVE_HMAC");
const llaveCifrado = Buffer.from(requerida("ROGATIO_LLAVE_CIFRADO"), "hex");
if (llaveCifrado.length !== 32) {
  throw new Error("ROGATIO_LLAVE_CIFRADO debe ser 32 bytes en hex (64 caracteres)");
}

// Por construir en la mesa: formato definitivo de la hoja (RFC 6962). Esto es un marcador.
function hojaMarcador(peticionId: number, hmac: string, secuencia: number): Buffer {
  return createHash("sha256")
    .update(Buffer.from([0]))
    .update(`${peticionId}:${hmac}:${secuencia}`)
    .digest();
}

const db = obtenerDb();

async function jurisdiccion(
  nivel: (typeof jurisdicciones.$inferInsert)["nivel"],
  codigo: string,
  nombre: string,
  padreId: number | null,
  configuracion: Record<string, unknown> = {},
): Promise<number> {
  await db
    .insert(jurisdicciones)
    .values({ nivel, codigo, nombre, padreId, configuracion })
    .onConflictDoNothing();
  const [fila] = await db
    .select({ id: jurisdicciones.id })
    .from(jurisdicciones)
    .where(and(eq(jurisdicciones.nivel, nivel), eq(jurisdicciones.codigo, codigo)));
  return fila.id;
}

async function principal() {
  const federacion = await jurisdiccion("federacion", "MX", "Estados Unidos Mexicanos", null);
  const cdmx = await jurisdiccion("entidad", "09", "Ciudad de México", federacion);
  const cuauhtemoc = await jurisdiccion("alcaldia", "09-015", "Cuauhtémoc", cdmx, {
    umbral: UMBRAL,
  });

  let [peticion] = await db
    .select()
    .from(peticiones)
    .where(eq(peticiones.slug, SLUG));
  if (!peticion) {
    [peticion] = await db
      .insert(peticiones)
      .values({
        slug: SLUG,
        titulo: TITULO,
        texto: TEXTO,
        categoria: CATEGORIA,
        jurisdiccionId: cuauhtemoc,
        umbral: UMBRAL,
        estado: "abierta",
      })
      .returning();
  }

  // Reinicio: deja la petición lista para la firma 50 en vivo.
  await db.delete(raices).where(eq(raices.peticionId, peticion.id));
  await db.delete(envios).where(eq(envios.peticionId, peticion.id));
  await db
    .delete(firmas)
    .where(and(eq(firmas.peticionId, peticion.id), gt(firmas.secuencia, FIRMAS_PRECARGADAS)));
  await db
    .update(peticiones)
    .set({ estado: "abierta", umbral: UMBRAL, titulo: TITULO, texto: TEXTO, categoria: CATEGORIA })
    .where(eq(peticiones.id, peticion.id));

  for (let i = 1; i <= FIRMAS_PRECARGADAS; i++) {
    const n = String(i).padStart(2, "0");
    // CURP inválidas a propósito: solo alimentan el HMAC.
    const curp = `XEXX000101HDFXXX${n}`;
    const hmac = curpHmac(curp, llaveHmac);

    await db
      .insert(personas)
      .values({
        curpHmac: hmac,
        nombreCifrado: cifrar(`Persona ficticia ${n}`, llaveCifrado),
        curpCifrada: cifrar(curp, llaveCifrado),
        entidad: ENTIDAD_CDMX,
        seccion: SECCION_FICTICIA,
      })
      .onConflictDoNothing();
    const [persona] = await db
      .select({ id: personas.id })
      .from(personas)
      .where(eq(personas.curpHmac, hmac));

    await db
      .insert(firmas)
      .values({
        peticionId: peticion.id,
        personaId: persona.id,
        secuencia: i,
        hoja: hojaMarcador(peticion.id, hmac, i),
      })
      .onConflictDoNothing();
  }

  console.log(
    `Semilla lista: petición ${peticion.id}, ${FIRMAS_PRECARGADAS} de ${UMBRAL} firmas.`,
  );
}

principal()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(cerrarDb);
