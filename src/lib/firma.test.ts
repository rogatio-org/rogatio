import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { cerrarDb, obtenerDb } from "@/db";
import { envios, firmas, jurisdicciones, personas, peticiones, raices } from "@/db/esquema";
import { curpHmac } from "@/db/seudonimo";
import { digitoVerificadorCurp } from "./curp";
import { validarDatosFirma, type DatosFirma } from "./datos-firma";
import { firmarPeticion } from "./firma";

try {
  process.loadEnvFile(".env.local");
} catch {}

// CURP sintética con dígito verificador válido.
const curp = (base17: string) => base17 + digitoVerificadorCurp(base17);

const valida = {
  nombre: "  ana   muestra ficticia ",
  curp: "mufa000101mdfscna8",
  claveElector: "MSFCAN00010109M100",
  seccion: "4523",
};

describe("validarDatosFirma", () => {
  it("normaliza los datos válidos", () => {
    expect(validarDatosFirma(valida)).toEqual({
      ok: true,
      datos: {
        nombre: "ANA MUESTRA FICTICIA",
        curp: "MUFA000101MDFSCNA8",
        claveElector: "MSFCAN00010109M100",
        entidad: 9,
        seccion: 4523,
      },
    });
  });

  it("marca cada campo inválido", () => {
    const r = validarDatosFirma({
      nombre: "",
      curp: "MUFA000101MDFSCNA7",
      claveElector: "X",
      seccion: "12345",
    });
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(Object.keys(r.errores).sort()).toEqual(["claveElector", "curp", "nombre", "seccion"]);
  });
});

// Necesita la base con la semilla. Usa una petición propia de umbral 2 y la borra al final.
describe.skipIf(!process.env.DATABASE_URL)("firmarPeticion", () => {
  const slug = `prueba-firma-${Date.now()}`;
  const curps = [curp("PUBA000101MDFRBNA"), curp("PUBB000101HDFRBNA"), curp("PUBC000101HDFRBNA")];
  const hmacs = curps.map((c) => curpHmac(c, process.env.ROGATIO_LLAVE_HMAC ?? ""));
  const datos = (i: number, seccion: number): DatosFirma => ({
    nombre: `PERSONA DE PRUEBA ${i}`,
    curp: curps[i],
    claveElector: "PRBAAA00010109M100",
    entidad: 9,
    seccion,
  });
  let peticionId: number;

  beforeAll(async () => {
    const db = obtenerDb();
    const [cuauhtemoc] = await db
      .select({ id: jurisdicciones.id })
      .from(jurisdicciones)
      .where(and(eq(jurisdicciones.nivel, "alcaldia"), eq(jurisdicciones.codigo, "09-015")));
    [{ id: peticionId }] = await db
      .insert(peticiones)
      .values({
        slug,
        titulo: "Prueba",
        texto: "Prueba",
        categoria: "prueba",
        jurisdiccionId: cuauhtemoc.id,
        umbral: 2,
      })
      .returning({ id: peticiones.id });
  });

  afterAll(async () => {
    const db = obtenerDb();
    await db.delete(envios).where(eq(envios.peticionId, peticionId));
    await db.delete(raices).where(eq(raices.peticionId, peticionId));
    await db.delete(firmas).where(eq(firmas.peticionId, peticionId));
    await db.delete(peticiones).where(eq(peticiones.id, peticionId));
    await db.delete(personas).where(inArray(personas.curpHmac, hmacs));
    await cerrarDb();
  });

  it("registra la primera firma con secuencia 1", async () => {
    expect(await firmarPeticion(slug, datos(0, 4523))).toEqual({
      tipo: "firmada",
      idComprobante: `${slug}-1`,
      secuencia: 1,
      umbralAlcanzado: false,
    });
  });

  it("no deja firmar dos veces y enlaza al primer comprobante", async () => {
    expect(await firmarPeticion(slug, datos(0, 4523))).toEqual({
      tipo: "ya_firmo",
      idComprobante: `${slug}-1`,
    });
    const filas = await obtenerDb().select().from(firmas).where(eq(firmas.peticionId, peticionId));
    expect(filas).toHaveLength(1);
  });

  it("rechaza otra alcaldía sin crear persona ni firma", async () => {
    expect(await firmarPeticion(slug, datos(2, 4269))).toEqual({
      tipo: "fuera_de_jurisdiccion",
      seccion: 4269,
      alcaldiaSeccion: "Benito Juárez",
      jurisdiccion: "Cuauhtémoc",
    });
    const filas = await obtenerDb().select().from(personas).where(eq(personas.curpHmac, hmacs[2]));
    expect(filas).toHaveLength(0);
  });

  it("al llegar al umbral cambia el estado y genera el envío simulado", async () => {
    const r = await firmarPeticion(slug, datos(1, 4524));
    expect(r).toMatchObject({ tipo: "firmada", secuencia: 2, umbralAlcanzado: true });
    const db = obtenerDb();
    const [peticion] = await db.select().from(peticiones).where(eq(peticiones.id, peticionId));
    expect(peticion.estado).toBe("umbral_alcanzado");
    const filas = await db.select().from(envios).where(eq(envios.peticionId, peticionId));
    expect(filas.map((e) => e.estado)).toEqual(["generado"]);
  });

  it("guarda nombre y CURP cifrados", async () => {
    const [persona] = await obtenerDb()
      .select()
      .from(personas)
      .where(eq(personas.curpHmac, hmacs[0]));
    expect(persona.nombreCifrado.toString("utf8")).not.toContain("PERSONA");
    expect(persona.curpCifrada?.toString("utf8")).not.toContain(curps[0]);
  });
});
