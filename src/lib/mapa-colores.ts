// Regla de anonimato y colores del mapa. Sin base: se usa también en el navegador.
export const MINIMO_ANONIMATO = 5;

export type FirmasSeccion = { seccion: number; firmas: number };

/** Quita las secciones con menos de 5 firmas y ordena de mayor a menor. */
export function filtrarAnonimato(filas: FirmasSeccion[]): FirmasSeccion[] {
  return filas
    .filter((f) => f.firmas >= MINIMO_ANONIMATO)
    .sort((a, b) => b.firmas - a.firmas || a.seccion - b.seccion);
}

/** Tramos de color del mapa. El último no tiene tope. */
export const TRAMOS: { minimo: number; maximo: number | null; color: string }[] = [
  { minimo: 5, maximo: 6, color: "#bfdbfe" },
  { minimo: 7, maximo: 8, color: "#60a5fa" },
  { minimo: 9, maximo: 11, color: "#2563eb" },
  { minimo: 12, maximo: null, color: "#1e3a8a" },
];

export function colorDeFirmas(n: number): string | null {
  return TRAMOS.findLast((t) => n >= t.minimo)?.color ?? null;
}
