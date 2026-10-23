import { describe, expect, it } from "vitest";
import { curpHmac } from "./seudonimo";

const curp = "XEXX000101HDFXXX01";

describe("curpHmac", () => {
  it("es determinista", () => {
    expect(curpHmac(curp, "llave-a")).toBe(curpHmac(curp, "llave-a"));
    expect(curpHmac(curp, "llave-a")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("cambia con otra llave", () => {
    expect(curpHmac(curp, "llave-a")).not.toBe(curpHmac(curp, "llave-b"));
  });

  it("normaliza mayúsculas y espacios", () => {
    expect(curpHmac(` ${curp.toLowerCase()} `, "llave-a")).toBe(
      curpHmac(curp, "llave-a"),
    );
  });
});
