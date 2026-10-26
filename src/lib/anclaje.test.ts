import { afterEach, describe, expect, it, vi } from "vitest";
import { actualizar, calendarioPermitido, sellar } from "./anclaje";
import { aHex, deHex } from "./merkle";
import {
  aplicar,
  atestaciones,
  escribirArchivoOts,
  escribirSello,
  leerArchivoOts,
  type Sello,
} from "./opentimestamps";

const RAIZ = deHex("bb".repeat(32));
const POOLS = ["https://a.pool.example", "https://b.pool.example"];
const CALENDARIO = "https://bob.btc.calendar.opentimestamps.org";

// Respuesta típica de un calendario: un prepend, sha256 y la atestación pendiente.
function respuestaCalendario(calendario: string, prefijo: number): Sello {
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

const respuestaBinaria = (sello: Sello) => new Response(Buffer.from(escribirSello(sello)));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("calendarioPermitido", () => {
  it("acepta los calendarios de fondo de la lista blanca y los configurados", () => {
    expect(calendarioPermitido(CALENDARIO, POOLS)).toBe(true);
    expect(calendarioPermitido("https://finney.calendar.eternitywall.com", POOLS)).toBe(true);
    expect(calendarioPermitido("https://a.pool.example", POOLS)).toBe(true);
  });

  it("rechaza http, dominios ajenos y URL dañadas", () => {
    expect(calendarioPermitido("http://bob.btc.calendar.opentimestamps.org", POOLS)).toBe(false);
    expect(calendarioPermitido("https://calendar.opentimestamps.org.evil.example", POOLS)).toBe(false);
    expect(calendarioPermitido("no es url", POOLS)).toBe(false);
  });
});

describe("sellar", () => {
  it("une las respuestas de los calendarios que responden", async () => {
    const fetchFalso = vi.fn(async (url: string) => {
      if (url.startsWith(POOLS[1])) return new Response("caído", { status: 503 });
      return respuestaBinaria(respuestaCalendario(CALENDARIO, 7));
    });
    vi.stubGlobal("fetch", fetchFalso);

    const ots = await sellar(RAIZ, POOLS);
    expect(fetchFalso).toHaveBeenCalledTimes(2);
    expect(fetchFalso.mock.calls[0][0]).toBe(`${POOLS[0]}/digest`);
    const { digest, sello } = leerArchivoOts(ots!);
    expect(aHex(digest)).toBe(aHex(RAIZ));
    expect((await atestaciones(sello, digest)).map((a) => a.atestacion)).toEqual([
      { tipo: "pendiente", calendario: CALENDARIO },
    ]);
  });

  it("da null si ningún calendario responde", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("caído", { status: 500 })));
    expect(await sellar(RAIZ, POOLS)).toBeNull();
  });
});

describe("actualizar", () => {
  it("cambia la atestación pendiente por la de Bitcoin", async () => {
    const ajeno = "https://calendario.ajeno.example";
    const ots = escribirArchivoOts(RAIZ, {
      atestaciones: [],
      ramas: [...respuestaCalendario(CALENDARIO, 1).ramas, ...respuestaCalendario(ajeno, 2).ramas],
    });
    // Mensaje que el calendario guarda: SHA-256(0x01 || raíz).
    const mensaje = await aplicar({ tipo: "sha256" }, Uint8Array.of(1, ...RAIZ));
    const completo: Sello = {
      atestaciones: [],
      ramas: [
        {
          operacion: { tipo: "append", argumento: Uint8Array.of(9) },
          sello: {
            atestaciones: [],
            ramas: [
              {
                operacion: { tipo: "sha256" },
                sello: { atestaciones: [{ tipo: "bitcoin", altura: 900000 }], ramas: [] },
              },
            ],
          },
        },
      ],
    };
    const fetchFalso = vi.fn(async (url: string) =>
      url === `${CALENDARIO}/timestamp/${aHex(mensaje)}`
        ? respuestaBinaria(completo)
        : new Response("Pendiente", { status: 404 }),
    );
    vi.stubGlobal("fetch", fetchFalso);

    const resultado = await actualizar(ots, POOLS);
    expect(resultado.bloqueBitcoin).toBe(900000);
    // Nunca consulta un calendario fuera de la lista blanca.
    expect(fetchFalso.mock.calls.map(([url]) => url)).toEqual([
      `${CALENDARIO}/timestamp/${aHex(mensaje)}`,
    ]);
    const { digest, sello } = leerArchivoOts(resultado.ots);
    expect((await atestaciones(sello, digest)).map((a) => a.atestacion)).toEqual([
      { tipo: "bitcoin", altura: 900000 },
      { tipo: "pendiente", calendario: ajeno },
    ]);
  });

  it("deja la prueba igual mientras el calendario responde 404", async () => {
    const ots = escribirArchivoOts(RAIZ, respuestaCalendario(CALENDARIO, 1));
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Pendiente", { status: 404 })));
    const resultado = await actualizar(ots, POOLS);
    expect(resultado).toEqual({ ots, bloqueBitcoin: null });
  });
});
