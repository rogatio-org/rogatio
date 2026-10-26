// Contrato de la hoja y del comprobante. Sin dependencias del servidor: sirve también en /verificar.
import { aHex, deHex, hashHoja, verificarInclusion, type Hash } from "./merkle";

// Datos de la hoja, en UTF-8: "rogatio-hoja-v1|<slug>|<secuencia>|<curp_hmac>".
// Sin nombre ni CURP. La hoja guardada en firmas.hoja es SHA-256(0x00 || datos).
const VERSION_HOJA = "rogatio-hoja-v1";

export type DatosHoja = { slug: string; secuencia: number; curpHmac: string };

export function datosDeHoja({ slug, secuencia, curpHmac }: DatosHoja): string {
  return `${VERSION_HOJA}|${slug}|${secuencia}|${curpHmac}`;
}

export function hojaDeFirma(datos: DatosHoja): Promise<Hash> {
  return hashHoja(datosDeHoja(datos));
}

// Id público del comprobante: "<slug>-<secuencia>", p. ej. "peticion-demo-12" (/comprobante/[id]).
export function idComprobante(slug: string, secuencia: number): string {
  return `${slug}-${secuencia}`;
}

export function leerIdComprobante(id: string): { slug: string; secuencia: number } | null {
  const partes = /^(.+)-([1-9]\d*)$/.exec(id);
  if (!partes) return null;
  return { slug: partes[1], secuencia: Number(partes[2]) };
}

// JSON descargable. Hashes en hex minúsculas. La hoja tiene el índice secuencia - 1
// en el árbol de `tamano` hojas cuya raíz es `raiz`.
export type Comprobante = {
  version: 1;
  peticion: string;
  secuencia: number;
  hoja: string;
  tamano: number;
  raiz: string;
  prueba: string[];
};

export function crearComprobante(datos: {
  peticion: string;
  secuencia: number;
  hoja: Hash;
  tamano: number;
  raiz: Hash;
  prueba: Hash[];
}): Comprobante {
  return {
    version: 1,
    peticion: datos.peticion,
    secuencia: datos.secuencia,
    hoja: aHex(datos.hoja),
    tamano: datos.tamano,
    raiz: aHex(datos.raiz),
    prueba: datos.prueba.map(aHex),
  };
}

/** Recalcula la raíz desde la hoja y la prueba. No valida la forma del JSON. */
export async function verificarComprobante(c: Comprobante): Promise<boolean> {
  try {
    return await verificarInclusion(
      deHex(c.hoja),
      c.secuencia - 1,
      c.tamano,
      c.prueba.map(deHex),
      deHex(c.raiz),
    );
  } catch {
    return false;
  }
}
