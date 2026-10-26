import { describe, expect, it } from "vitest";
import {
  crearComprobante,
  datosDeHoja,
  hojaDeFirma,
  idComprobante,
  leerIdComprobante,
  verificarComprobante,
} from "./comprobante";
import { pruebaDeInclusion, raiz } from "./merkle";

describe("comprobante", () => {
  it("arma los datos de la hoja sin nombre ni CURP", () => {
    expect(datosDeHoja({ slug: "peticion-demo", secuencia: 3, curpHmac: "ab12" })).toBe(
      "rogatio-hoja-v1|peticion-demo|3|ab12",
    );
  });

  it("lee el id del comprobante aunque el slug tenga guiones", () => {
    expect(idComprobante("peticion-demo", 12)).toBe("peticion-demo-12");
    expect(leerIdComprobante("peticion-demo-12")).toEqual({ slug: "peticion-demo", secuencia: 12 });
    expect(leerIdComprobante("peticion-demo")).toBeNull();
    expect(leerIdComprobante("peticion-demo-0")).toBeNull();
  });

  it("verifica un comprobante válido y rechaza uno alterado", async () => {
    const hojas = await Promise.all(
      Array.from({ length: 49 }, (_, i) =>
        hojaDeFirma({ slug: "peticion-demo", secuencia: i + 1, curpHmac: `hmac${i}` }),
      ),
    );
    const comprobante = crearComprobante({
      peticion: "peticion-demo",
      secuencia: 12,
      hoja: hojas[11],
      tamano: 49,
      raiz: await raiz(hojas),
      prueba: await pruebaDeInclusion(11, hojas),
    });
    expect(await verificarComprobante(comprobante)).toBe(true);
    const otraHoja = (comprobante.hoja[0] === "0" ? "1" : "0") + comprobante.hoja.slice(1);
    expect(await verificarComprobante({ ...comprobante, hoja: otraHoja })).toBe(false);
    expect(await verificarComprobante({ ...comprobante, hoja: "zz" })).toBe(false);
  });
});
