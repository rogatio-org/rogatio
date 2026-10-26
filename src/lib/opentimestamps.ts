// Formato de las pruebas de OpenTimestamps (.ots). Usa Web Crypto: corre en el servidor y en el navegador.
// Referencia: https://github.com/opentimestamps/python-opentimestamps (core/timestamp.py, core/notary.py).
// El "archivo" sellado es la raíz del registro: el digest del .ots es la raíz misma.
import { aHex, sonIguales } from "./merkle";

export type Operacion =
  | { tipo: "sha256" | "sha1" | "reverse" | "hexlify" }
  | { tipo: "append" | "prepend"; argumento: Uint8Array };

export type Atestacion =
  | { tipo: "bitcoin"; altura: number }
  | { tipo: "pendiente"; calendario: string }
  | { tipo: "desconocida"; etiqueta: Uint8Array; datos: Uint8Array };

// Un sello es un árbol: cada rama aplica una operación al mensaje y sigue con otro sello.
export type Sello = {
  atestaciones: Atestacion[];
  ramas: { operacion: Operacion; sello: Sello }[];
};

export class ErrorOts extends Error {}

const CABECERA = Uint8Array.of(
  0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00,
  0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94,
);
const VERSION = 1;

const OP_SHA1 = 0x02;
const OP_SHA256 = 0x08;
const OP_APPEND = 0xf0;
const OP_PREPEND = 0xf1;
const OP_REVERSE = 0xf2;
const OP_HEXLIFY = 0xf3;

const ETIQUETA_BITCOIN = Uint8Array.of(0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01);
const ETIQUETA_PENDIENTE = Uint8Array.of(0x83, 0xdf, 0xe3, 0x0d, 0x2e, 0xf9, 0x0c, 0x8e);

const MAX_ARGUMENTO = 4096;
const MAX_URI = 1000;
const MAX_PROFUNDIDAD = 256;

// --- Lectura ---

class Lector {
  private pos = 0;
  constructor(private readonly bytes: Uint8Array) {}

  byte(): number {
    if (this.pos >= this.bytes.length) throw new ErrorOts("Prueba .ots incompleta");
    return this.bytes[this.pos++];
  }

  leer(n: number): Uint8Array {
    if (this.pos + n > this.bytes.length) throw new ErrorOts("Prueba .ots incompleta");
    const parte = this.bytes.slice(this.pos, this.pos + n);
    this.pos += n;
    return parte;
  }

  varuint(): number {
    let valor = 0;
    let factor = 1;
    for (;;) {
      const b = this.byte();
      valor += (b & 0x7f) * factor;
      if (!(b & 0x80)) return valor;
      factor *= 128;
      if (factor > 2 ** 49) throw new ErrorOts("Entero demasiado grande");
    }
  }

  varbytes(max: number): Uint8Array {
    const n = this.varuint();
    if (n > max) throw new ErrorOts("Dato demasiado largo");
    return this.leer(n);
  }

  alFinal(): boolean {
    return this.pos === this.bytes.length;
  }
}

function leerAtestacion(l: Lector): Atestacion {
  const etiqueta = l.leer(8);
  const datos = l.varbytes(8192);
  const interno = new Lector(datos);
  if (sonIguales(etiqueta, ETIQUETA_BITCOIN)) {
    const altura = interno.varuint();
    return { tipo: "bitcoin", altura };
  }
  if (sonIguales(etiqueta, ETIQUETA_PENDIENTE)) {
    const uri = new TextDecoder().decode(interno.varbytes(MAX_URI));
    if (!/^[a-zA-Z0-9.\-_/:]+$/.test(uri)) throw new ErrorOts("Calendario no válido");
    return { tipo: "pendiente", calendario: uri };
  }
  return { tipo: "desconocida", etiqueta, datos };
}

function leerOperacion(l: Lector, etiqueta: number): Operacion {
  switch (etiqueta) {
    case OP_SHA256:
      return { tipo: "sha256" };
    case OP_SHA1:
      return { tipo: "sha1" };
    case OP_REVERSE:
      return { tipo: "reverse" };
    case OP_HEXLIFY:
      return { tipo: "hexlify" };
    case OP_APPEND:
    case OP_PREPEND: {
      const argumento = l.varbytes(MAX_ARGUMENTO);
      if (argumento.length === 0) throw new ErrorOts("Operación sin argumento");
      return { tipo: etiqueta === OP_APPEND ? "append" : "prepend", argumento };
    }
    default:
      throw new ErrorOts(`Operación no soportada: 0x${etiqueta.toString(16)}`);
  }
}

function leerSelloDe(l: Lector, profundidad: number): Sello {
  if (profundidad > MAX_PROFUNDIDAD) throw new ErrorOts("Prueba .ots demasiado profunda");
  const sello: Sello = { atestaciones: [], ramas: [] };
  const agregar = (etiqueta: number) => {
    if (etiqueta === 0x00) {
      sello.atestaciones.push(leerAtestacion(l));
    } else {
      const operacion = leerOperacion(l, etiqueta);
      sello.ramas.push({ operacion, sello: leerSelloDe(l, profundidad + 1) });
    }
  };
  let etiqueta = l.byte();
  while (etiqueta === 0xff) {
    agregar(l.byte());
    etiqueta = l.byte();
  }
  agregar(etiqueta);
  return sello;
}

/** Lee un sello sin cabecera, como lo devuelve un calendario. */
export function leerSello(bytes: Uint8Array): Sello {
  const l = new Lector(bytes);
  const sello = leerSelloDe(l, 0);
  if (!l.alFinal()) throw new ErrorOts("Sobran datos al final del sello");
  return sello;
}

/** Lee un archivo .ots completo. Solo acepta digest SHA-256. */
export function leerArchivoOts(bytes: Uint8Array): { digest: Uint8Array; sello: Sello } {
  const l = new Lector(bytes);
  if (!sonIguales(l.leer(CABECERA.length), CABECERA)) {
    throw new ErrorOts("El archivo no es una prueba de OpenTimestamps");
  }
  if (l.varuint() !== VERSION) throw new ErrorOts("Versión de .ots no soportada");
  if (l.byte() !== OP_SHA256) throw new ErrorOts("El .ots no usa SHA-256");
  const digest = l.leer(32);
  const sello = leerSelloDe(l, 0);
  if (!l.alFinal()) throw new ErrorOts("Sobran datos al final del .ots");
  return { digest, sello };
}

// --- Escritura ---

class Escritor {
  private partes: number[] = [];

  byte(b: number) {
    this.partes.push(b);
  }

  bytes(datos: Uint8Array) {
    for (const b of datos) this.partes.push(b);
  }

  varuint(n: number) {
    while (n >= 0x80) {
      this.partes.push((n % 128) | 0x80);
      n = Math.floor(n / 128);
    }
    this.partes.push(n);
  }

  varbytes(datos: Uint8Array) {
    this.varuint(datos.length);
    this.bytes(datos);
  }

  resultado(): Uint8Array {
    return Uint8Array.from(this.partes);
  }
}

function escribirAtestacion(e: Escritor, a: Atestacion) {
  const datos = new Escritor();
  if (a.tipo === "bitcoin") {
    e.bytes(ETIQUETA_BITCOIN);
    datos.varuint(a.altura);
  } else if (a.tipo === "pendiente") {
    e.bytes(ETIQUETA_PENDIENTE);
    datos.varbytes(new TextEncoder().encode(a.calendario));
  } else {
    e.bytes(a.etiqueta);
    datos.bytes(a.datos);
  }
  e.varbytes(datos.resultado());
}

const ETIQUETAS: Record<Operacion["tipo"], number> = {
  sha256: OP_SHA256,
  sha1: OP_SHA1,
  reverse: OP_REVERSE,
  hexlify: OP_HEXLIFY,
  append: OP_APPEND,
  prepend: OP_PREPEND,
};

function escribirSelloEn(e: Escritor, sello: Sello) {
  const elementos = [
    ...sello.atestaciones.map((a) => () => {
      e.byte(0x00);
      escribirAtestacion(e, a);
    }),
    ...sello.ramas.map(({ operacion, sello: hijo }) => () => {
      e.byte(ETIQUETAS[operacion.tipo]);
      if ("argumento" in operacion) e.varbytes(operacion.argumento);
      escribirSelloEn(e, hijo);
    }),
  ];
  if (elementos.length === 0) throw new ErrorOts("Sello vacío");
  elementos.forEach((escribir, i) => {
    // Todos los elementos menos el último van precedidos de 0xff.
    if (i < elementos.length - 1) e.byte(0xff);
    escribir();
  });
}

export function escribirSello(sello: Sello): Uint8Array {
  const e = new Escritor();
  escribirSelloEn(e, sello);
  return e.resultado();
}

export function escribirArchivoOts(digest: Uint8Array, sello: Sello): Uint8Array {
  if (digest.length !== 32) throw new ErrorOts("El digest debe tener 32 bytes");
  const e = new Escritor();
  e.bytes(CABECERA);
  e.varuint(VERSION);
  e.byte(OP_SHA256);
  e.bytes(digest);
  escribirSelloEn(e, sello);
  return e.resultado();
}

/** Une varios sellos del mismo mensaje, p. ej. las respuestas de varios calendarios. */
export function unirSellos(sellos: Sello[]): Sello {
  return {
    atestaciones: sellos.flatMap((s) => s.atestaciones),
    ramas: sellos.flatMap((s) => s.ramas),
  };
}

// --- Recorrido ---

async function digerir(algoritmo: "SHA-256" | "SHA-1", datos: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest(algoritmo, new Uint8Array(datos)));
}

function concatenar(a: Uint8Array, b: Uint8Array): Uint8Array {
  const r = new Uint8Array(a.length + b.length);
  r.set(a);
  r.set(b, a.length);
  return r;
}

export async function aplicar(operacion: Operacion, mensaje: Uint8Array): Promise<Uint8Array> {
  switch (operacion.tipo) {
    case "sha256":
      return digerir("SHA-256", mensaje);
    case "sha1":
      return digerir("SHA-1", mensaje);
    case "reverse":
      return mensaje.slice().reverse();
    case "hexlify":
      return new TextEncoder().encode(aHex(mensaje));
    case "append":
      return concatenar(mensaje, operacion.argumento);
    case "prepend":
      return concatenar(operacion.argumento, mensaje);
  }
}

export type AtestacionConMensaje = { atestacion: Atestacion; mensaje: Uint8Array };

/** Todas las atestaciones del sello, cada una con el mensaje que certifica. */
export async function atestaciones(sello: Sello, mensaje: Uint8Array): Promise<AtestacionConMensaje[]> {
  const propias = sello.atestaciones.map((atestacion) => ({ atestacion, mensaje }));
  const hijas = await Promise.all(
    sello.ramas.map(async ({ operacion, sello: hijo }) =>
      atestaciones(hijo, await aplicar(operacion, mensaje)),
    ),
  );
  return [...propias, ...hijas.flat()];
}

// --- Verificación ---

// Raíz de Merkle de un bloque de Bitcoin, en hex como la muestran los exploradores.
export type ConsultaBloque = (altura: number) => Promise<{ raizMerkle: string; fecha: Date }>;

export type ResultadoOts =
  | { estado: "anclada"; altura: number; fecha: Date }
  | { estado: "pendiente"; calendarios: string[] }
  | { estado: "no_coincide" }
  | { estado: "no_valido"; motivo: string }
  | { estado: "sin_consulta"; altura: number; raizMerkle: string };

/** Consulta de bloques en blockstream.info. Solo pide datos públicos del bloque. */
export const consultarBlockstream: ConsultaBloque = async (altura) => {
  const base = "https://blockstream.info/api";
  const hash = await fetch(`${base}/block-height/${altura}`).then((r) => {
    if (!r.ok) throw new Error("Bloque no encontrado");
    return r.text();
  });
  const bloque = (await fetch(`${base}/block/${hash.trim()}`).then((r) => {
    if (!r.ok) throw new Error("Bloque no encontrado");
    return r.json();
  })) as { merkle_root: string; timestamp: number };
  return { raizMerkle: bloque.merkle_root, fecha: new Date(bloque.timestamp * 1000) };
};

/**
 * Verifica que el .ots selle `raizHex`. Si tiene atestación de Bitcoin, compara el mensaje
 * con la raíz de Merkle del bloque. La más antigua que coincide fija la fecha.
 */
export async function verificarOts(
  bytes: Uint8Array,
  raizHex: string,
  consultar: ConsultaBloque | null = consultarBlockstream,
): Promise<ResultadoOts> {
  let archivo: ReturnType<typeof leerArchivoOts>;
  let lista: AtestacionConMensaje[];
  try {
    archivo = leerArchivoOts(bytes);
    lista = await atestaciones(archivo.sello, archivo.digest);
  } catch (error) {
    return { estado: "no_valido", motivo: error instanceof ErrorOts ? error.message : "Prueba .ots dañada" };
  }
  if (aHex(archivo.digest) !== raizHex.trim().toLowerCase()) return { estado: "no_coincide" };

  const bitcoin = lista
    .filter((a): a is AtestacionConMensaje & { atestacion: { tipo: "bitcoin" } } =>
      a.atestacion.tipo === "bitcoin",
    )
    .sort((a, b) => a.atestacion.altura - b.atestacion.altura);

  let discrepancia: number | null = null;
  for (const { atestacion, mensaje } of bitcoin) {
    if (mensaje.length !== 32) continue;
    // Los exploradores muestran la raíz de Merkle con los bytes al revés.
    const esperada = aHex(mensaje.slice().reverse());
    if (!consultar) return { estado: "sin_consulta", altura: atestacion.altura, raizMerkle: esperada };
    let bloque: Awaited<ReturnType<ConsultaBloque>>;
    try {
      bloque = await consultar(atestacion.altura);
    } catch {
      return { estado: "sin_consulta", altura: atestacion.altura, raizMerkle: esperada };
    }
    if (bloque.raizMerkle.toLowerCase() === esperada) {
      return { estado: "anclada", altura: atestacion.altura, fecha: bloque.fecha };
    }
    discrepancia ??= atestacion.altura;
  }
  if (discrepancia !== null) {
    return { estado: "no_valido", motivo: `No coincide con el bloque ${discrepancia}` };
  }

  const calendarios = lista.flatMap(({ atestacion }) =>
    atestacion.tipo === "pendiente" ? [atestacion.calendario] : [],
  );
  if (calendarios.length > 0) return { estado: "pendiente", calendarios };
  return { estado: "no_valido", motivo: "La prueba no tiene atestaciones conocidas" };
}
