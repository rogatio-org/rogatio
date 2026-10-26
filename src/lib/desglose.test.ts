import { describe, expect, it } from "vitest";
import { agruparPorDistrito, numeroDeDistrito } from "./desglose";

const df2 = { codigo: "DF-09-02", nombre: "Distrito federal 2 de la Ciudad de México" };
const df12 = { codigo: "DF-09-12", nombre: "Distrito federal 12 de la Ciudad de México" };
const dl9 = { codigo: "DL-09-09", nombre: "Distrito local 9 de la Ciudad de México" };
const dl12 = { codigo: "DL-09-12", nombre: "Distrito local 12 de la Ciudad de México" };

describe("desglose por distrito", () => {
  it("suma por distrito y cuadra con el total", () => {
    const desglose = agruparPorDistrito([
      { federal: df12, local: dl12, firmas: 25 },
      { federal: df2, local: dl9, firmas: 11 },
      { federal: df12, local: dl9, firmas: 13 },
    ]);
    expect(desglose.federales).toEqual([
      { ...df2, firmas: 11 },
      { ...df12, firmas: 38 },
    ]);
    expect(desglose.locales).toEqual([
      { ...dl9, firmas: 24 },
      { ...dl12, firmas: 25 },
    ]);
    expect(desglose.sinDistrito).toBe(0);
    const suma = (l: { firmas: number }[]) => l.reduce((s, d) => s + d.firmas, 0);
    expect(suma(desglose.federales)).toBe(49);
    expect(suma(desglose.locales)).toBe(49);
  });

  it("cuenta aparte las firmas de secciones sin distrito", () => {
    const desglose = agruparPorDistrito([
      { federal: null, local: null, firmas: 2 },
      { federal: df2, local: dl9, firmas: 1 },
    ]);
    expect(desglose.sinDistrito).toBe(2);
    expect(desglose.federales).toEqual([{ ...df2, firmas: 1 }]);
  });

  it("sin firmas da listas vacías", () => {
    expect(agruparPorDistrito([])).toEqual({ federales: [], locales: [], sinDistrito: 0 });
  });

  it("lee el número del código", () => {
    expect(numeroDeDistrito("DL-09-12")).toBe(12);
    expect(numeroDeDistrito("DF-09-02")).toBe(2);
    expect(numeroDeDistrito("raro")).toBeNull();
  });
});
