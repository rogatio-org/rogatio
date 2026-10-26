// Árbol de Merkle de RFC 6962 (secc. 2.1). Usa Web Crypto: corre en el servidor y en el navegador.
// Las "hojas" de este módulo ya son hashes de hoja: SHA-256(0x00 || datos).

export type Hash = Uint8Array;

async function sha256(...partes: Uint8Array[]): Promise<Hash> {
  const total = partes.reduce((n, p) => n + p.length, 0);
  const datos = new Uint8Array(total);
  let desplazamiento = 0;
  for (const parte of partes) {
    datos.set(parte, desplazamiento);
    desplazamiento += parte.length;
  }
  return new Uint8Array(await crypto.subtle.digest("SHA-256", datos));
}

const PREFIJO_HOJA = Uint8Array.of(0x00);
const PREFIJO_NODO = Uint8Array.of(0x01);

/** SHA-256(0x00 || datos). */
export function hashHoja(datos: Uint8Array | string): Promise<Hash> {
  const bytes = typeof datos === "string" ? new TextEncoder().encode(datos) : datos;
  return sha256(PREFIJO_HOJA, bytes);
}

/** SHA-256(0x01 || izq || der). */
export function hashNodo(izq: Hash, der: Hash): Promise<Hash> {
  return sha256(PREFIJO_NODO, izq, der);
}

// Mayor potencia de 2 estrictamente menor que n (n > 1).
function corte(n: number): number {
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}

/** MTH(D[n]). Con cero hojas, SHA-256 de la cadena vacía. */
export async function raiz(hojas: Hash[]): Promise<Hash> {
  if (hojas.length === 0) return sha256();
  if (hojas.length === 1) return hojas[0];
  const k = corte(hojas.length);
  return hashNodo(await raiz(hojas.slice(0, k)), await raiz(hojas.slice(k)));
}

/** PATH(m, D[n]): hashes hermanos de la hoja `indice` (base 0), de abajo hacia arriba. */
export async function pruebaDeInclusion(indice: number, hojas: Hash[]): Promise<Hash[]> {
  if (!Number.isInteger(indice) || indice < 0 || indice >= hojas.length) {
    throw new RangeError("Índice fuera del árbol");
  }
  if (hojas.length === 1) return [];
  const k = corte(hojas.length);
  if (indice < k) {
    return [...(await pruebaDeInclusion(indice, hojas.slice(0, k))), await raiz(hojas.slice(k))];
  }
  return [...(await pruebaDeInclusion(indice - k, hojas.slice(k))), await raiz(hojas.slice(0, k))];
}

/** Verificación de RFC 9162, secc. 2.1.3.2. */
export async function verificarInclusion(
  hoja: Hash,
  indice: number,
  tamano: number,
  prueba: Hash[],
  raizEsperada: Hash,
): Promise<boolean> {
  if (!Number.isInteger(indice) || !Number.isInteger(tamano) || indice < 0 || indice >= tamano) {
    return false;
  }
  let fn = indice;
  let sn = tamano - 1;
  let r = hoja;
  for (const p of prueba) {
    if (sn === 0) return false;
    if (fn % 2 === 1 || fn === sn) {
      r = await hashNodo(p, r);
      if (fn % 2 === 0) {
        while (fn % 2 === 0 && fn !== 0) {
          fn = Math.floor(fn / 2);
          sn = Math.floor(sn / 2);
        }
      }
    } else {
      r = await hashNodo(r, p);
    }
    fn = Math.floor(fn / 2);
    sn = Math.floor(sn / 2);
  }
  return sn === 0 && sonIguales(r, raizEsperada);
}

export function sonIguales(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a[i] ^ b[i];
  return diferencia === 0;
}

export function aHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function deHex(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})*$/i.test(hex)) throw new Error("Hex no válido");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
