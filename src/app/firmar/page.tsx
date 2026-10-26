import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CircleCheck } from "lucide-react";
import { EnlaceBoton } from "@/components/enlace-boton";
import { EnlaceEscrito } from "@/components/enlace-escrito";
import { FormularioFirma } from "@/components/formulario-firma";
import { obtenerPeticion } from "@/lib/consultas";
import { motivoSinFirmas, recibeFirmas } from "@/lib/estado-peticion";
import { peticionDemo } from "@/lib/peticion-demo";

export const metadata: Metadata = { title: "Firmar · Rogatio" };

// La demo tiene una sola petición: la del fixture, que también siembra la base.
export default function Firmar() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Firmar la petición</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando petición…</p>}>
        <ContenidoFirmar />
      </Suspense>
    </div>
  );
}

// Se lee la base en cada visita: si la petición ya no está abierta, no se muestra el formulario.
async function ContenidoFirmar() {
  await connection();
  const { id } = peticionDemo.peticion;
  const datos = await obtenerPeticion(id);
  const titulo = datos?.peticion.titulo ?? peticionDemo.peticion.titulo;

  if (datos && !recibeFirmas(datos.peticion.estado ?? "abierta", datos.conteo)) {
    const motivo = motivoSinFirmas(datos.peticion.estado ?? "umbral_alcanzado");
    return (
      <section
        role="status"
        className="space-y-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-5 text-emerald-950 sm:p-6 dark:bg-emerald-950/30 dark:text-emerald-100"
      >
        <div className="flex gap-3">
          <CircleCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-emerald-700" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{motivo.titulo}</h2>
            <p>{motivo.texto}</p>
            <p className="text-sm">
              {titulo}: {datos.conteo.firmas} de {datos.conteo.umbral} firmas.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <EnlaceEscrito id={id} conteo={datos.conteo} variant="default" className="h-10 px-4 sm:w-auto" />
          <EnlaceBoton href={`/peticion/${id}`} variant="outline" className="h-10 bg-transparent px-4">
            Ver la petición
          </EnlaceBoton>
        </div>
      </section>
    );
  }

  return <FormularioFirma slug={id} titulo={titulo} />;
}
