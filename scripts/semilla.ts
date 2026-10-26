// Semilla y reinicio de la demo (2026-10-26). Idempotente. Solo datos ficticios.
// Carga las secciones electorales de Cuauhtémoc y unas de Benito Juárez (data/ine) con sus distritos.
import { readFileSync } from "node:fs";
import { and, eq, gt } from "drizzle-orm";
import { cerrarDb, obtenerDb } from "../src/db";
import {
  envios,
  firmas,
  jurisdicciones,
  personas,
  peticiones,
  raices,
  seccionesElectorales,
} from "../src/db/esquema";
import { cifrar } from "../src/db/cifrado";
import { curpHmac } from "../src/db/seudonimo";
import { hojaDeFirma } from "../src/lib/comprobante";
import { aHex } from "../src/lib/merkle";
import { guardarRaiz } from "../src/lib/registro";
import demo from "../data/fixtures/peticion-demo.json";

try {
  process.loadEnvFile(".env.local");
} catch {}

const UMBRAL = 50;
const FIRMAS_PRECARGADAS = 49;
const ENTIDAD_CDMX = 9;
// Acuerdo de la distritación vigente (ver docs/arquitectura/01-jurisdicciones.md, secc. 3).
const DISTRITACION = "INE/CG875/2022";
// La petición sale del mismo fixture que usa la UI.
const { id: SLUG, titulo: TITULO, texto: TEXTO, categoria: CATEGORIA } = demo.peticion;

// Firmas concentradas en Roma Norte, alrededor de la calle Mérida: [sección, firmas].
// Seis secciones llegan a 5 o más y salen en el mapa; cuatro quedan por debajo.
const REPARTO_SECCIONES: [number, number][] = [
  [4542, 10],
  [4543, 8],
  [4540, 7],
  [4544, 6],
  [4556, 5],
  [4539, 5],
  [4773, 3],
  [4786, 2],
  [4538, 2],
  [4541, 1],
];
const SECCIONES_FIRMAS = REPARTO_SECCIONES.flatMap(([seccion, n]) =>
  Array<number>(n).fill(seccion),
);
if (SECCIONES_FIRMAS.length !== FIRMAS_PRECARGADAS) {
  throw new Error("El reparto por sección debe sumar las firmas precargadas");
}

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

type FilaSeccion = {
  entidad: number;
  municipio: number;
  seccion: number;
  distritoFederal: number;
  distritoLocal: number;
};

// Columnas: entidad,municipio,seccion,distrito_federal,distrito_local.
function leerSecciones(ruta: string): FilaSeccion[] {
  const [, ...filas] = readFileSync(ruta, "utf8").trim().split(/\r?\n/);
  return filas.map((fila) => {
    const [entidad, municipio, seccion, distritoFederal, distritoLocal] = fila
      .split(",")
      .map(Number);
    return { entidad, municipio, seccion, distritoFederal, distritoLocal };
  });
}

const dosDigitos = (n: number) => String(n).padStart(2, "0");

// Códigos estables de los nodos electorales:
//   circunscripción 'C-4', distrito federal 'DF-09-02', distrito local 'DL-09-12'
//   (entidad y número de distrito con dos dígitos).
async function cargarSecciones(
  filas: FilaSeccion[],
  alcaldiaId: number,
  entidadId: number,
  circunscripcionId: number,
) {
  const distritos = new Map<string, number>();
  async function distrito(
    nivel: "distrito_federal" | "distrito_local",
    entidad: number,
    n: number,
  ) {
    const prefijo = nivel === "distrito_federal" ? "DF" : "DL";
    const codigo = `${prefijo}-${dosDigitos(entidad)}-${dosDigitos(n)}`;
    let id = distritos.get(codigo);
    if (id === undefined) {
      const nombre = `Distrito ${nivel === "distrito_federal" ? "federal" : "local"} ${n} de la Ciudad de México`;
      id = await jurisdiccion(
        nivel,
        codigo,
        nombre,
        nivel === "distrito_federal" ? circunscripcionId : entidadId,
      );
      distritos.set(codigo, id);
    }
    return id;
  }

  const valores = [];
  for (const fila of filas) {
    valores.push({
      entidad: fila.entidad,
      seccion: fila.seccion,
      alcaldiaId,
      distritoFederalId: await distrito("distrito_federal", fila.entidad, fila.distritoFederal),
      distritoLocalId: await distrito("distrito_local", fila.entidad, fila.distritoLocal),
      distritacion: DISTRITACION,
    });
  }
  await db.insert(seccionesElectorales).values(valores).onConflictDoNothing();
}

async function principal() {
  const federacion = await jurisdiccion("federacion", "MX", "Estados Unidos Mexicanos", null);
  const cdmx = await jurisdiccion("entidad", "09", "Ciudad de México", federacion);
  // Toda la CDMX está en la 4.ª circunscripción plurinominal.
  const circunscripcion = await jurisdiccion(
    "circunscripcion",
    "C-4",
    "Cuarta circunscripción",
    federacion,
  );
  const cuauhtemoc = await jurisdiccion("alcaldia", "09-015", "Cuauhtémoc", cdmx, {
    umbral: UMBRAL,
  });

  const seccionesCuauhtemoc = leerSecciones("data/ine/secciones-cuauhtemoc.csv");
  await cargarSecciones(seccionesCuauhtemoc, cuauhtemoc, cdmx, circunscripcion);

  // Secciones de otra alcaldía para probar el rechazo de quien no vive en Cuauhtémoc.
  const benitoJuarez = await jurisdiccion("alcaldia", "09-014", "Benito Juárez", cdmx);
  await cargarSecciones(
    leerSecciones("data/ine/secciones-otra-alcaldia.csv"),
    benitoJuarez,
    cdmx,
    circunscripcion,
  );

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
    const seccion = SECCIONES_FIRMAS[i - 1];
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
        seccion,
      })
      .onConflictDoUpdate({ target: personas.curpHmac, set: { entidad: ENTIDAD_CDMX, seccion } });
    const [persona] = await db
      .select({ id: personas.id })
      .from(personas)
      .where(eq(personas.curpHmac, hmac));

    const hoja = Buffer.from(await hojaDeFirma({ slug: SLUG, secuencia: i, curpHmac: hmac }));
    await db
      .insert(firmas)
      .values({ peticionId: peticion.id, personaId: persona.id, secuencia: i, hoja })
      .onConflictDoUpdate({
        target: [firmas.peticionId, firmas.secuencia],
        set: { personaId: persona.id, hoja },
      });
  }

  // Raíz publicada de las 49 firmas: la misma en cada corrida.
  const { raiz } = await guardarRaiz(db, peticion.id);

  console.log(
    `Semilla lista: petición ${peticion.id}, ${FIRMAS_PRECARGADAS} de ${UMBRAL} firmas, raíz ${aHex(raiz)}.`,
  );
}

principal()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(cerrarDb);
