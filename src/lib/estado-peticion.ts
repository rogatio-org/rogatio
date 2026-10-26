// Estados de la petición y si recibe firmas. Isomórfico: lo usan la página, /firmar y la acción.

// Mismos valores que el enum estado_peticion de src/db/esquema.ts.
export type EstadoPeticion = "borrador" | "abierta" | "umbral_alcanzado" | "enviada" | "cerrada";

/** Solo una petición abierta y debajo de su umbral recibe firmas. */
export function recibeFirmas(
  estado: EstadoPeticion,
  { firmas, umbral }: { firmas: number; umbral: number },
) {
  return estado === "abierta" && firmas < umbral;
}

/** Texto para quien intenta firmar una petición que ya no recibe firmas. */
export function motivoSinFirmas(estado: EstadoPeticion): { titulo: string; texto: string } {
  switch (estado) {
    case "abierta":
    case "umbral_alcanzado":
      return {
        titulo: "Esta petición ya alcanzó su umbral",
        texto:
          "Ya juntó las firmas que necesitaba y no recibe más. El siguiente paso es el escrito del Art. 8 para la autoridad.",
      };
    case "enviada":
      return {
        titulo: "Esta petición ya se envió",
        texto: "El escrito del Art. 8 ya se envió a la autoridad (simulado). No recibe más firmas.",
      };
    case "borrador":
      return {
        titulo: "Esta petición aún no recibe firmas",
        texto: "La petición está en borrador. Podrás firmar cuando se publique.",
      };
    case "cerrada":
      return {
        titulo: "Esta petición ya no recibe firmas",
        texto: "La petición está cerrada.",
      };
  }
}
