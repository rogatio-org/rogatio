import { createCipheriv, randomBytes } from "node:crypto";

// AES-256-GCM: iv (12) || etiqueta (16) || texto cifrado.
export function cifrar(texto: string, llave: Buffer): Buffer {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", llave, iv);
  const cuerpo = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  return Buffer.concat([iv, cifrador.getAuthTag(), cuerpo]);
}
