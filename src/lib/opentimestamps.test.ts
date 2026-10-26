import { describe, expect, it } from "vitest";
import { aHex, deHex } from "./merkle";
import {
  atestaciones,
  escribirArchivoOts,
  escribirSello,
  leerArchivoOts,
  leerSello,
  unirSellos,
  verificarOts,
  type ConsultaBloque,
  type Sello,
} from "./opentimestamps";

// Ejemplo oficial del cliente de OpenTimestamps: examples/gdp2q25-2nd.pdf.ots,
// anclado en el bloque 912095 de Bitcoin. Solo usa SHA-256, append y prepend.
const EJEMPLO_OTS = Uint8Array.from(
  Buffer.from(
    "AE9wZW5UaW1lc3RhbXBzAABQcm9vZgC/ieLohOiSlAEIxwlyoSkItzwkB9nMaEK6KgIgOmkPMJDNKfMMRfDP2T3xYwIAAAACNTE71JgdZnkaPFuV+2vxQ/RN/h8czDvYS6kv5zdgPxYAAAAAAP3///83p2gTClYGpmscCXzWIlTMElmD4tqhQBvJkfaDaJ5FqgAAAAAA/f///wIAAAAAAAAAACJqIPAj0loAAAAAAAAWABRDl3KafBOqk0Nu+4ksMYw7bwcWvN3qDQAICPAgzzw8OIr2Yxk9/yM8NDxjG1U+0RCETQncte39In61nsMICPAg68bwcQyQUQuYasjGB5L14cxdsAlHObcQhzO+v21KsbAICPAgtSXmkM5drcxSKB30q55twcuWsqF60FwTs2dNDdqng3QICPAgW1UrDoX6DElEam+1/6yXVz128HRoO3G7A951S1qipisICPEgS2nFHl/N49NQXnQRigjfX3/+r9YvZF9h8QKkguioyWoICPEgX41KoznMZPU8VfQjJW42hNsiKGQE5c19DOXEq347QVUICPAgvfbt1B3tAU1H49b1Sm5efJhN/1wjPeBtIwBwzus+yYMICPEg5dqmZ9ra0Rl/rcx3LZmws2EOrLE6s0Ib2Ni/1iTuoKQICPEg+fFVnN/woD6FeYcCQVgwW0vdwZy8qt52reIkAFQPzVcICPAgyQWo6q3OzcusNtFzd/iavdL4Crc5g5peTAh89r7iD6oICPAghd3TGA2Nw0wmtfekeRXk/Lwir4LALaNzCP/8ni/PyOYICPAguDrO7lkYnyEN88VTqKWERnco4K6LCyphvjgDuItvMmQICAAFiJYNc9cZAQPf1Tc=",
    "base64",
  ),
);
const EJEMPLO_DIGEST = "c70972a12908b73c2407d9cc6842ba2a02203a690f3090cd29f30c45f0cfd93d";
const BLOQUE_912095 = "936131994129988e1932d8c1c6a9780fd42ae4c87204cfb0ac852be1250039ae";

const consultaFija: ConsultaBloque = async (altura) => {
  if (altura !== 912095) throw new Error("Bloque desconocido");
  return { raizMerkle: BLOQUE_912095, fecha: new Date(1756386670 * 1000) };
};

const RAIZ = deHex("aa".repeat(32));

function selloPendiente(calendario: string, prefijo: number): Sello {
  return {
    atestaciones: [],
    ramas: [
      {
        operacion: { tipo: "prepend", argumento: Uint8Array.of(prefijo) },
        sello: {
          atestaciones: [],
          ramas: [
            {
              operacion: { tipo: "sha256" },
              sello: { atestaciones: [{ tipo: "pendiente", calendario }], ramas: [] },
            },
          ],
        },
      },
    ],
  };
}

describe("leerArchivoOts", () => {
  it("lee el ejemplo oficial y lo vuelve a escribir igual", () => {
    const { digest, sello } = leerArchivoOts(EJEMPLO_OTS);
    expect(aHex(digest)).toBe(EJEMPLO_DIGEST);
    expect(escribirArchivoOts(digest, sello)).toEqual(EJEMPLO_OTS);
  });

  it("rechaza un archivo que no es .ots", () => {
    expect(() => leerArchivoOts(new TextEncoder().encode("{}".padEnd(64)))).toThrow(/no es una prueba/);
  });

  it("rechaza un .ots truncado", () => {
    expect(() => leerArchivoOts(EJEMPLO_OTS.slice(0, 200))).toThrow(/incompleta/);
  });
});

describe("sellos de calendario", () => {
  it("une las respuestas de dos calendarios y conserva sus atestaciones", async () => {
    const a = selloPendiente("https://a.example", 1);
    const b = selloPendiente("https://b.example", 2);
    const unido = leerSello(escribirSello(unirSellos([a, b])));
    const lista = await atestaciones(unido, RAIZ);
    expect(lista.map((x) => x.atestacion)).toEqual([
      { tipo: "pendiente", calendario: "https://a.example" },
      { tipo: "pendiente", calendario: "https://b.example" },
    ]);
    // El mensaje del calendario es SHA-256(prefijo || raíz).
    const esperado = new Uint8Array(
      await crypto.subtle.digest("SHA-256", Uint8Array.of(1, ...RAIZ)),
    );
    expect(lista[0].mensaje).toEqual(esperado);
  });
});

describe("verificarOts", () => {
  it("ancla el ejemplo oficial en el bloque 912095", async () => {
    const r = await verificarOts(EJEMPLO_OTS, EJEMPLO_DIGEST, consultaFija);
    expect(r).toEqual({ estado: "anclada", altura: 912095, fecha: new Date(1756386670000) });
  });

  it("sin consulta, da la raíz de Merkle que hay que comparar", async () => {
    const r = await verificarOts(EJEMPLO_OTS, EJEMPLO_DIGEST, null);
    expect(r).toEqual({ estado: "sin_consulta", altura: 912095, raizMerkle: BLOQUE_912095 });
  });

  it("detecta un .ots de otra raíz", async () => {
    const r = await verificarOts(EJEMPLO_OTS, "00".repeat(32), consultaFija);
    expect(r).toEqual({ estado: "no_coincide" });
  });

  it("detecta un .ots alterado", async () => {
    const alterado = EJEMPLO_OTS.slice();
    // Un byte dentro de la transacción de Bitcoin.
    alterado[100] ^= 0x01;
    const r = await verificarOts(alterado, EJEMPLO_DIGEST, consultaFija);
    expect(r).toEqual({ estado: "no_valido", motivo: "No coincide con el bloque 912095" });
  });

  it("reporta los calendarios de un sello pendiente", async () => {
    const ots = escribirArchivoOts(RAIZ, selloPendiente("https://a.example", 1));
    const r = await verificarOts(ots, aHex(RAIZ), consultaFija);
    expect(r).toEqual({ estado: "pendiente", calendarios: ["https://a.example"] });
  });
});
