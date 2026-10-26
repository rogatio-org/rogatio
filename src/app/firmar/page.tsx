import type { Metadata } from "next";
import { FormularioFirma } from "@/components/formulario-firma";
import { peticionDemo } from "@/lib/peticion-demo";

export const metadata: Metadata = { title: "Firmar · Rogatio" };

// La demo tiene una sola petición: la del fixture, que también siembra la base.
export default function Firmar() {
  const { id, titulo } = peticionDemo.peticion;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Firmar la petición</h1>
      <FormularioFirma slug={id} titulo={titulo} />
    </div>
  );
}
