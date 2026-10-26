// Campos del formulario de firma y estados de la acción. Isomórfico: lo usan /firmar y la acción.
import { mensajeErrorCurp, normalizarCurp, validarCurp } from "./curp";

export type DatosFirma = {
  nombre: string;
  curp: string;
  claveElector: string;
  entidad: number;
  seccion: number;
};

export type CampoFirma = "nombre" | "curp" | "claveElector" | "seccion";

export type EstadoFirma =
  | { tipo: "inicial" }
  | { tipo: "invalido"; errores: Partial<Record<CampoFirma, string>> }
  | { tipo: "firmada"; idComprobante: string; secuencia: number; umbralAlcanzado: boolean }
  | { tipo: "ya_firmo"; idComprobante: string }
  | {
      tipo: "fuera_de_jurisdiccion";
      seccion: number;
      alcaldiaSeccion: string | null;
      jurisdiccion: string;
    }
  | { tipo: "peticion_inexistente" }
  | { tipo: "peticion_cerrada" }
  | { tipo: "error" };

// La clave de elector no se guarda: solo se revisa su forma.
const CLAVE_ELECTOR = /^[A-Z]{6}\d{8}[HMX]\d{3}$/;
const ENTIDAD_CDMX = 9;

/** Valida y normaliza los campos del formulario. No toca la base. */
export function validarDatosFirma(
  entrada: Partial<Record<CampoFirma, unknown>>,
): { ok: true; datos: DatosFirma } | { ok: false; errores: Partial<Record<CampoFirma, string>> } {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const nombre = texto(entrada.nombre).replace(/\s+/g, " ").toUpperCase();
  const curp = normalizarCurp(texto(entrada.curp));
  const claveElector = texto(entrada.claveElector).toUpperCase();
  const seccionTexto = texto(entrada.seccion);

  const errores: Partial<Record<CampoFirma, string>> = {};
  if (nombre.length < 3 || nombre.length > 120) errores.nombre = "Escribe tu nombre completo.";
  const errorCurp = validarCurp(curp);
  if (errorCurp) errores.curp = mensajeErrorCurp[errorCurp];
  if (!CLAVE_ELECTOR.test(claveElector)) {
    errores.claveElector = "La clave de elector debe tener 18 caracteres.";
  }
  if (!/^\d{1,4}$/.test(seccionTexto) || Number(seccionTexto) === 0) {
    errores.seccion = "La sección tiene hasta 4 dígitos.";
  }
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  // En la demo todas las credenciales son de la CDMX.
  return {
    ok: true,
    datos: { nombre, curp, claveElector, entidad: ENTIDAD_CDMX, seccion: Number(seccionTexto) },
  };
}
