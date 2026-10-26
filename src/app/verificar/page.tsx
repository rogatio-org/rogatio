import type { Metadata } from "next";
import { VerificadorComprobante } from "@/components/verificador-comprobante";

export const metadata: Metadata = { title: "Verificar · Rogatio" };

export default function Verificar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verificar un comprobante</h1>
      <p className="leading-relaxed">
        Carga el comprobante que descargaste al firmar. Tu navegador recalcula la raíz del registro
        con la prueba de inclusión y te dice si la firma está en el registro público.
      </p>
      <VerificadorComprobante />
    </div>
  );
}
