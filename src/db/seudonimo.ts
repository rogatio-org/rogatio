import { createHmac } from "node:crypto";

/** Seudónimo de una persona: HMAC-SHA256(llave, CURP) en hex. */
export function curpHmac(curp: string, llave: string | Buffer): string {
  return createHmac("sha256", llave)
    .update(curp.trim().toUpperCase(), "utf8")
    .digest("hex");
}
