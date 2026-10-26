import { describe, expect, it } from "vitest";
import {
  aHex,
  deHex,
  hashHoja,
  pruebaDeInclusion,
  raiz,
  verificarInclusion,
  type Hash,
} from "./merkle";

async function hojasDePrueba(n: number): Promise<Hash[]> {
  return Promise.all(Array.from({ length: n }, (_, i) => hashHoja(`hoja ${i}`)));
}

describe("merkle", () => {
  it("coincide con los vectores de prueba de Certificate Transparency", async () => {
    const datos = [
      "",
      "00",
      "10",
      "2021",
      "3031",
      "40414243",
      "5051525354555657",
      "606162636465666768696a6b6c6d6e6f",
    ];
    const hojas = await Promise.all(datos.map((d) => hashHoja(deHex(d))));
    expect(aHex(await raiz([]))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(aHex(await raiz(hojas.slice(0, 1)))).toBe(
      "6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d",
    );
    expect(aHex(await raiz(hojas))).toBe(
      "5dc9da79a70659a9ad559cb701ded9a2ab9d823aad2f4960cfe370eff4604328",
    );
  });

  for (const n of [1, 2, 3, 7, 50]) {
    it(`verifica todas las hojas de un árbol de ${n}`, async () => {
      const hojas = await hojasDePrueba(n);
      const r = await raiz(hojas);
      for (let i = 0; i < n; i++) {
        const prueba = await pruebaDeInclusion(i, hojas);
        expect(await verificarInclusion(hojas[i], i, n, prueba, r)).toBe(true);
      }
    });
  }

  it("rechaza una hoja alterada", async () => {
    const hojas = await hojasDePrueba(50);
    const r = await raiz(hojas);
    const prueba = await pruebaDeInclusion(17, hojas);
    const alterada = Uint8Array.from(hojas[17]);
    alterada[0] ^= 1;
    expect(await verificarInclusion(alterada, 17, 50, prueba, r)).toBe(false);
  });

  it("rechaza índice, tamaño o prueba equivocados", async () => {
    const hojas = await hojasDePrueba(7);
    const r = await raiz(hojas);
    const prueba = await pruebaDeInclusion(3, hojas);
    expect(await verificarInclusion(hojas[3], 4, 7, prueba, r)).toBe(false);
    const pruebaUltima = await pruebaDeInclusion(6, hojas);
    expect(await verificarInclusion(hojas[6], 6, 8, pruebaUltima, r)).toBe(false);
    expect(await verificarInclusion(hojas[3], 3, 7, prueba.slice(1), r)).toBe(false);
    expect(await verificarInclusion(hojas[3], 7, 7, prueba, r)).toBe(false);
  });

  it("no importa node:crypto", async () => {
    const { readFile } = await import("node:fs/promises");
    const fuente = await readFile(new URL("./merkle.ts", import.meta.url), "utf8");
    expect(fuente).not.toMatch(/node:crypto|from "crypto"/);
  });
});
