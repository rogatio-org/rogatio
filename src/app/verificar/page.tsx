import type { Metadata } from "next";
import { PorConstruir } from "@/components/por-construir";

export const metadata: Metadata = { title: "Verificar · Rogatio" };

export default function Verificar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verificar un comprobante</h1>
      <p>Cualquier persona podrá comprobar que una firma está en el registro público.</p>
      <PorConstruir
        titulo="Verificación en el navegador"
        tareas={[
          "Recibir un comprobante (hoja, prueba de inclusión y raíz).",
          "Recalcular la raíz en el cliente, sin confiar en el servidor.",
          "Comparar contra la raíz publicada y mostrar el resultado.",
        ]}
      />
    </div>
  );
}
