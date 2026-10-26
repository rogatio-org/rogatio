import { describe, expect, it } from "vitest";
import { crearComprobante, hojaDeFirma } from "./comprobante";
import { pruebaDeInclusion, raiz } from "./merkle";
import { verificarTexto } from "./verificacion";

async function comprobanteDeMuestra() {
  const hojas = await Promise.all(
    Array.from({ length: 49 }, (_, i) =>
      hojaDeFirma({ slug: "peticion-demo", secuencia: i + 1, curpHmac: `hmac${i}` }),
    ),
  );
  return crearComprobante({
    peticion: "peticion-demo",
    secuencia: 12,
    hoja: hojas[11],
    tamano: 49,
    raiz: await raiz(hojas),
    prueba: await pruebaDeInclusion(11, hojas),
  });
}

// Cambia un carácter hex por otro distinto.
function alterar(hex: string, posicion = 0): string {
  const nuevo = hex[posicion] === "0" ? "1" : "0";
  return hex.slice(0, posicion) + nuevo + hex.slice(posicion + 1);
}

describe("verificarTexto", () => {
  it("da válido con el JSON descargado", async () => {
    const c = await comprobanteDeMuestra();
    const resultado = await verificarTexto(JSON.stringify(c, null, 2));
    expect(resultado.estado).toBe("valido");
  });

  it("da no válido si cambia un carácter de la hoja", async () => {
    const c = await comprobanteDeMuestra();
    const resultado = await verificarTexto(JSON.stringify({ ...c, hoja: alterar(c.hoja, 5) }));
    expect(resultado.estado).toBe("no_valido");
  });

  it("da no válido si la hoja deja de ser hex, la secuencia cambia o la prueba se altera", async () => {
    const c = await comprobanteDeMuestra();
    const casos = [
      { ...c, hoja: "z" + c.hoja.slice(1) },
      { ...c, secuencia: 13 },
      { ...c, prueba: [alterar(c.prueba[0]), ...c.prueba.slice(1)] },
      { ...c, raiz: alterar(c.raiz) },
    ];
    for (const caso of casos) {
      expect((await verificarTexto(JSON.stringify(caso))).estado).toBe("no_valido");
    }
  });

  it("compara contra la raíz publicada", async () => {
    const c = await comprobanteDeMuestra();
    const texto = JSON.stringify(c);
    const igual = await verificarTexto(texto, ` ${c.raiz.toUpperCase()} `);
    expect(igual).toMatchObject({ estado: "valido", coincideRaizPublicada: true });
    const distinta = await verificarTexto(texto, alterar(c.raiz));
    expect(distinta).toMatchObject({
      estado: "no_valido",
      inclusionValida: true,
      coincideRaizPublicada: false,
    });
  });

  it("distingue un comprobante alterado aunque se dé una raíz publicada distinta", async () => {
    const c = await comprobanteDeMuestra();
    const texto = JSON.stringify({ ...c, hoja: alterar(c.hoja) });
    const resultado = await verificarTexto(texto, alterar(c.raiz));
    expect(resultado).toMatchObject({ estado: "no_valido", inclusionValida: false });
  });

  it("da error si el archivo no es JSON o no tiene la forma del comprobante", async () => {
    expect(await verificarTexto("esto no es json")).toEqual({ estado: "error", error: "no_es_json" });
    expect(await verificarTexto("[]")).toEqual({ estado: "error", error: "forma_invalida" });
    expect(await verificarTexto('{"version":1}')).toEqual({ estado: "error", error: "forma_invalida" });
  });
});
