// Esquema mínimo de la demo. Sin PostGIS: la geometría llega después.
// Ver docs/arquitectura/01-jurisdicciones.md (secc. 4) y 04-autenticacion.md (secc. 7).
import {
  bigint,
  bigserial,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const nivelJurisdiccion = pgEnum("nivel_jurisdiccion", [
  "federacion",
  "entidad",
  "alcaldia",
  "unidad_territorial",
  "circunscripcion",
  "distrito_federal",
  "distrito_local",
]);

export const estadoPeticion = pgEnum("estado_peticion", [
  "borrador",
  "abierta",
  "umbral_alcanzado",
  "enviada",
  "cerrada",
]);

export const estadoEnvio = pgEnum("estado_envio", [
  "pendiente",
  "generado",
  "enviado_simulado",
  "fallido",
]);

export const jurisdicciones = pgTable(
  "jurisdicciones",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    nivel: nivelJurisdiccion("nivel").notNull(),
    padreId: bigint("padre_id", { mode: "number" }).references(
      (): AnyPgColumn => jurisdicciones.id,
    ),
    // Clave oficial, p. ej. '09-015' o 'DL-12'.
    codigo: text("codigo").notNull(),
    nombre: text("nombre").notNull(),
    configuracion: jsonb("configuracion")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
  },
  (t) => [unique().on(t.nivel, t.codigo)],
);

export const seccionesElectorales = pgTable(
  "secciones_electorales",
  {
    // 9 (código INE '09') para la CDMX.
    entidad: smallint("entidad").notNull(),
    seccion: integer("seccion").notNull(),
    alcaldiaId: bigint("alcaldia_id", { mode: "number" })
      .notNull()
      .references(() => jurisdicciones.id),
    distritoFederalId: bigint("distrito_federal_id", { mode: "number" })
      .notNull()
      .references(() => jurisdicciones.id),
    distritoLocalId: bigint("distrito_local_id", { mode: "number" })
      .notNull()
      .references(() => jurisdicciones.id),
    // Versión de la distritación, p. ej. 'INE 2023'.
    distritacion: text("distritacion").notNull(),
  },
  (t) => [primaryKey({ columns: [t.entidad, t.seccion] })],
);

// En claro solo curp_hmac, (entidad, seccion) y verificado_en.
export const personas = pgTable("personas", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  curpHmac: text("curp_hmac").notNull().unique(),
  nombreCifrado: bytea("nombre_cifrado").notNull(),
  curpCifrada: bytea("curp_cifrada"),
  // Sin FK a secciones_electorales mientras no exista su semilla.
  entidad: smallint("entidad").notNull(),
  seccion: integer("seccion").notNull(),
  verificadoEn: timestamp("verificado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const peticiones = pgTable("peticiones", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  // Identificador público en la URL: /peticion/[slug].
  slug: text("slug").notNull().unique(),
  titulo: text("titulo").notNull(),
  texto: text("texto").notNull(),
  categoria: text("categoria").notNull(),
  jurisdiccionId: bigint("jurisdiccion_id", { mode: "number" })
    .notNull()
    .references(() => jurisdicciones.id),
  // Congelado al crear la petición; no cambia si cambia la configuración.
  umbral: integer("umbral").notNull(),
  estado: estadoPeticion("estado").notNull().default("abierta"),
  creadaEn: timestamp("creada_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const firmas = pgTable(
  "firmas",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    peticionId: bigint("peticion_id", { mode: "number" })
      .notNull()
      .references(() => peticiones.id),
    personaId: bigint("persona_id", { mode: "number" })
      .notNull()
      .references(() => personas.id),
    // Número de secuencia en el registro de la petición (desde 1).
    secuencia: integer("secuencia").notNull(),
    // Hash de la hoja del árbol de Merkle.
    hoja: bytea("hoja").notNull(),
    creadaEn: timestamp("creada_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.peticionId, t.personaId),
    unique().on(t.peticionId, t.secuencia),
  ],
);

// Por construir en la mesa: cálculo de la raíz y prueba de inclusión Merkle.
export const raices = pgTable(
  "raices",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    peticionId: bigint("peticion_id", { mode: "number" })
      .notNull()
      .references(() => peticiones.id),
    tamano: integer("tamano").notNull(),
    raiz: bytea("raiz").notNull(),
    creadaEn: timestamp("creada_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.peticionId, t.tamano)],
);

// Simulado en la demo: nada se envía de verdad.
export const envios = pgTable("envios", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  peticionId: bigint("peticion_id", { mode: "number" })
    .notNull()
    .references(() => peticiones.id),
  estado: estadoEnvio("estado").notNull().default("pendiente"),
  hashPdf: bytea("hash_pdf"),
  hashAcuse: bytea("hash_acuse"),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
  enviadoEn: timestamp("enviado_en", { withTimezone: true }),
});
