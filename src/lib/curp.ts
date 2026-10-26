// Validación de la CURP (formato de RENAPO y dígito verificador). Isomórfico.

const ENTIDADES =
  "AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE";

// Fecha AAMMDD, sexo H, M o X, entidad de nacimiento, tres consonantes internas,
// homoclave (dígito antes de 2000, letra desde 2000) y dígito verificador.
const FORMATO = new RegExp(
  `^[A-Z][AEIOUX][A-Z]{2}\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])[HMX](${ENTIDADES})[B-DF-HJ-NP-TV-Z]{3}[A-Z\\d]\\d$`,
);

const DICCIONARIO = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export function normalizarCurp(curp: string): string {
  return curp.trim().toUpperCase();
}

/** Dígito verificador de los primeros 17 caracteres. */
export function digitoVerificadorCurp(curp17: string): number {
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const valor = DICCIONARIO.indexOf(curp17[i]);
    if (valor < 0) throw new RangeError("Carácter no válido en la CURP");
    suma += valor * (18 - i);
  }
  return (10 - (suma % 10)) % 10;
}

export type ErrorCurp = "longitud" | "formato" | "digito_verificador";

/** null si la CURP es válida; si no, el motivo. */
export function validarCurp(curp: string): ErrorCurp | null {
  const c = normalizarCurp(curp);
  if (c.length !== 18) return "longitud";
  if (!FORMATO.test(c)) return "formato";
  if (digitoVerificadorCurp(c.slice(0, 17)) !== Number(c[17])) return "digito_verificador";
  return null;
}

export const mensajeErrorCurp: Record<ErrorCurp, string> = {
  longitud: "La CURP debe tener 18 caracteres.",
  formato: "La CURP no tiene el formato correcto.",
  digito_verificador: "La CURP no es válida: revisa el último carácter.",
};
