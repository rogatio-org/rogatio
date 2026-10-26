import { describe, expect, it } from "vitest";
import { motivoSinFirmas, recibeFirmas } from "./estado-peticion";

describe("recibeFirmas", () => {
  it("una petición abierta debajo del umbral recibe firmas", () => {
    expect(recibeFirmas("abierta", { firmas: 49, umbral: 50 })).toBe(true);
  });

  it("al llegar al umbral ya no recibe firmas", () => {
    expect(recibeFirmas("abierta", { firmas: 50, umbral: 50 })).toBe(false);
    expect(recibeFirmas("umbral_alcanzado", { firmas: 50, umbral: 50 })).toBe(false);
  });

  it("borrador, enviada y cerrada no reciben firmas", () => {
    for (const estado of ["borrador", "enviada", "cerrada"] as const) {
      expect(recibeFirmas(estado, { firmas: 0, umbral: 50 })).toBe(false);
    }
  });
});

describe("motivoSinFirmas", () => {
  it("explica el umbral alcanzado", () => {
    expect(motivoSinFirmas("umbral_alcanzado").titulo).toBe("Esta petición ya alcanzó su umbral");
  });
});
