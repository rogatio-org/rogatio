import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ConteoFirmas } from "@/components/conteo-firmas";
import { DesgloseDistritos } from "@/components/desglose-distritos";
import { EnlaceBoton } from "@/components/enlace-boton";
import { AvisoUmbral, EstadoEnvio } from "@/components/estado-umbral";
import { PorConstruir } from "@/components/por-construir";
import { obtenerPeticion } from "@/lib/consultas";
import { obtenerDesglosePorDistrito } from "@/lib/desglose";

// Sin generateStaticParams: el conteo y la raíz se leen de la base en cada visita, nunca en el build.
export async function generateMetadata({
  params,
}: PageProps<"/peticion/[id]">): Promise<Metadata> {
  const { id } = await params;
  await connection();
  const datos = await obtenerPeticion(id);
  return { title: datos ? `${datos.peticion.titulo} · Rogatio` : "Rogatio" };
}

export default function Peticion({ params }: PageProps<"/peticion/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando petición…</p>}>
      {params.then(({ id }) => (
        <ContenidoPeticion id={id} />
      ))}
    </Suspense>
  );
}

async function ContenidoPeticion({ id }: { id: string }) {
  await connection();
  const [datos, desglose] = await Promise.all([
    obtenerPeticion(id),
    obtenerDesglosePorDistrito(id),
  ]);
  if (!datos) notFound();

  const { peticion, conteo, raiz, envio } = datos;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {peticion.autoridad} · {peticion.ubicacion}
        </p>
        <h1 className="text-2xl font-bold">{peticion.titulo}</h1>
      </header>

      <p className="leading-relaxed">{peticion.texto}</p>

      <AvisoUmbral conteo={conteo} />

      <ConteoFirmas conteo={conteo} />

      <EnlaceBoton href="/firmar" className="w-full sm:w-auto">
        Firmar esta petición
      </EnlaceBoton>

      <dl className="grid gap-3 rounded-lg border p-4 text-sm">
        <div>
          <dt className="font-semibold">Raíz del registro</dt>
          <dd className="font-mono break-all">{raiz.hash}</dd>
        </div>
        <div>
          <dt className="font-semibold">Firmas en el árbol</dt>
          <dd>{raiz.tamano_arbol}</dd>
        </div>
        <div>
          <dt className="font-semibold">Estado del envío</dt>
          <dd>
            <EstadoEnvio envio={envio} conteo={conteo} />
          </dd>
        </div>
      </dl>

      <DesgloseDistritos desglose={desglose} />

      <PorConstruir
        titulo="Envío al umbral"
        tareas={[
          "Al llegar al umbral, habilitar la generación del PDF del Art. 8 (simulado).",
        ]}
      />
    </article>
  );
}
