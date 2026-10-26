import { describe, expect, it } from "vitest";
import { digitoVerificadorCurp, validarCurp } from "./curp";

// CURP sintéticas de las credenciales de muestra: no son de personas reales.
const MUESTRA = "MUFA000101MDFSCNA8";
const OTRA = "EEFL990101HDFJCS05";

describe("curp", () => {
  it("acepta CURP con formato y dígito verificador correctos", () => {
    expect(validarCurp(MUESTRA)).toBeNull();
    expect(validarCurp(OTRA)).toBeNull();
    expect(validarCurp(` ${MUESTRA.toLowerCase()} `)).toBeNull();
  });

  it("calcula el dígito verificador", () => {
    expect(digitoVerificadorCurp(MUESTRA.slice(0, 17))).toBe(8);
    expect(digitoVerificadorCurp(OTRA.slice(0, 17))).toBe(5);
  });

  it("rechaza un dígito verificador incorrecto", () => {
    expect(validarCurp("MUFA000101MDFSCNA7")).toBe("digito_verificador");
  });

  it("rechaza longitud y formato incorrectos", () => {
    expect(validarCurp("MUFA000101")).toBe("longitud");
    // Mes 13.
    expect(validarCurp("MUFA001301MDFSCNA8")).toBe("formato");
    // Entidad inexistente.
    expect(validarCurp("MUFA000101MZZSCNA8")).toBe("formato");
  });
});
