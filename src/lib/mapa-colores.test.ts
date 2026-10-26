import { describe, expect, it } from "vitest";
import { colorDeFirmas, filtrarAnonimato } from "./mapa-colores";

describe("mapa", () => {
  it("quita las secciones con menos de 5 firmas", () => {
    expect(
      filtrarAnonimato([
        { seccion: 4541, firmas: 1 },
        { seccion: 4556, firmas: 5 },
        { seccion: 4773, firmas: 4 },
        { seccion: 4542, firmas: 10 },
      ]),
    ).toEqual([
      { seccion: 4542, firmas: 10 },
      { seccion: 4556, firmas: 5 },
    ]);
  });

  it("da color solo desde 5 firmas", () => {
    expect(colorDeFirmas(4)).toBeNull();
    expect(colorDeFirmas(5)).toBe("#bfdbfe");
    expect(colorDeFirmas(10)).toBe("#2563eb");
    expect(colorDeFirmas(40)).toBe("#1e3a8a");
  });
});
