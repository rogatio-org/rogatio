// Verificación del comprobante en el navegador. Sin llamadas al servidor.
import { verificarComprobante, type Comprobante } from "./comprobante";

export type ErrorLectura = "no_es_json" | "forma_invalida";

export type ResultadoVerificacion =
  | {
      estado: "valido" | "no_valido";
      comprobante: Comprobante;
      // null si no se dio una raíz publicada para comparar.
      coincideRaizPublicada: boolean | null;
    }
  | { estado: "error"; error: ErrorLectura };

const esEnteroPositivo = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;

/**
 * Lee el JSON y valida su forma. No revisa que los hashes sean hex:
 * un hash alterado es un comprobante "no válido", no un archivo con error.
 */
export function leerComprobante(
  texto: string,
): { ok: true; comprobante: Comprobante } | { ok: false; error: ErrorLectura } {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false, error: "no_es_json" };
  }
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    return { ok: false, error: "forma_invalida" };
  }
  const c = datos as Record<string, unknown>;
  const formaValida =
    c.version === 1 &&
    typeof c.peticion === "string" &&
    c.peticion.length > 0 &&
    esEnteroPositivo(c.secuencia) &&
    esEnteroPositivo(c.tamano) &&
    typeof c.hoja === "string" &&
    typeof c.raiz === "string" &&
    Array.isArray(c.prueba) &&
    c.prueba.every((h) => typeof h === "string");
  if (!formaValida) return { ok: false, error: "forma_invalida" };

  return {
    ok: true,
    comprobante: {
      version: 1,
      peticion: c.peticion as string,
      secuencia: c.secuencia as number,
      hoja: (c.hoja as string).toLowerCase(),
      tamano: c.tamano as number,
      raiz: (c.raiz as string).toLowerCase(),
      prueba: (c.prueba as string[]).map((h) => h.toLowerCase()),
    },
  };
}

/** Recalcula la raíz y, si se da, la compara con la raíz publicada en la petición. */
export async function verificarTexto(
  texto: string,
  raizPublicada?: string,
): Promise<ResultadoVerificacion> {
  const lectura = leerComprobante(texto);
  if (!lectura.ok) return { estado: "error", error: lectura.error };
  const { comprobante } = lectura;

  const publicada = raizPublicada?.trim().toLowerCase();
  const coincideRaizPublicada = publicada ? publicada === comprobante.raiz : null;
  const valido = (await verificarComprobante(comprobante)) && coincideRaizPublicada !== false;

  return { estado: valido ? "valido" : "no_valido", comprobante, coincideRaizPublicada };
}
