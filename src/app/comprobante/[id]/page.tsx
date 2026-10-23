import type { Metadata } from "next";
import { Suspense } from "react";
import { PorConstruir } from "@/components/por-construir";

export const metadata: Metadata = { title: "Comprobante · Rogatio" };

// El id del comprobante solo se conoce en tiempo de petición.
export default function Comprobante({ params }: PageProps<"/comprobante/[id]">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comprobante de firma</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando comprobante…</p>}>
        {params.then(({ id }) => (
          <p>
            Comprobante <span className="font-mono break-all">{id}</span>
          </p>
        ))}
      </Suspense>
      <PorConstruir
        titulo="Contenido del comprobante"
        tareas={[
          "Mostrar el número de secuencia y el hash de la hoja.",
          "Mostrar la raíz del árbol al momento de firmar.",
          "Generar la prueba de inclusión Merkle (RFC 6962).",
          "Permitir descargar el comprobante para verificarlo después.",
        ]}
      />
    </div>
  );
}
