"use client";

import { Button } from "@/components/ui/button";
import type { Comprobante } from "@/lib/comprobante";

// Descarga el comprobante como JSON, generado en el navegador.
export function DescargarComprobante({ comprobante }: { comprobante: Comprobante }) {
  function descargar() {
    const contenido = JSON.stringify(comprobante, null, 2);
    const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `comprobante-${comprobante.peticion}-${comprobante.secuencia}.json`;
    enlace.click();
    // Algunos navegadores cancelan la descarga si la URL se revoca de inmediato.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Button size="lg" onClick={descargar} className="w-full sm:w-auto">
      Descargar comprobante
    </Button>
  );
}
