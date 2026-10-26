import type { Metadata } from "next";
import { VerificadorComprobante } from "@/components/verificador-comprobante";

export const metadata: Metadata = { title: "Verificar · Rogatio" };

export default function Verificar() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Verificar un comprobante</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        Carga el comprobante que descargaste al firmar. Tu navegador recalcula la raíz del registro
        con la prueba de inclusión y te dice si la firma está en el registro público.
      </p>
      <VerificadorComprobante />
    </div>
  );
}
