import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Landmark, MapPin, PenLine } from "lucide-react";
import { ConteoFirmas } from "@/components/conteo-firmas";
import { DesgloseDistritos } from "@/components/desglose-distritos";
import { EnlaceBoton } from "@/components/enlace-boton";
import { EnlaceEscrito } from "@/components/enlace-escrito";
import { AvisoUmbral, EstadoEnvio } from "@/components/estado-umbral";
import { Badge } from "@/components/ui/badge";
import { obtenerPeticion } from "@/lib/consultas";
import { obtenerDesglosePorDistrito } from "@/lib/desglose";
import { escritoDisponible, estadoEnvioVisible } from "@/lib/escrito-art8";
import { motivoSinFirmas, recibeFirmas } from "@/lib/estado-peticion";

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
  const abierta = recibeFirmas(peticion.estado ?? "abierta", conteo);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Alcaldía {peticion.jurisdiccion.nombre}</Badge>
          <Badge variant={abierta ? "outline" : "default"}>
            {abierta ? "Recibe firmas" : "Ya no recibe firmas"}
          </Badge>
        </div>
        <h1 className="max-w-3xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {peticion.titulo}
        </h1>
        <div className="flex flex-col gap-1 text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
          <p className="flex items-center gap-1.5">
            <Landmark aria-hidden className="size-4 shrink-0" />
            Para la {peticion.autoridad}
          </p>
          <p className="flex items-start gap-1.5 text-sm sm:items-center">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 sm:mt-0" />
            {peticion.ubicacion}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <aside className="lg:col-start-2 lg:row-start-1">
          <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-16">
            <ConteoFirmas conteo={conteo} />
            {abierta ? (
              <EnlaceBoton href="/firmar" className="h-11 w-full text-base">
                <PenLine aria-hidden />
                Firmar esta petición
              </EnlaceBoton>
            ) : (
              <>
                <EnlaceEscrito
                  id={peticion.id}
                  conteo={conteo}
                  variant="default"
                  className="h-11 text-base"
                />
                {!escritoDisponible(conteo) && (
                  <p className="text-sm text-muted-foreground">
                    {motivoSinFirmas(peticion.estado ?? "cerrada").titulo}.
                  </p>
                )}
              </>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold">Estado del envío</p>
              <div className="mt-1.5 text-sm">
                <EstadoEnvio
                  envio={{ ...envio, estado: estadoEnvioVisible(envio.estado, conteo) }}
                  conteo={conteo}
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8 lg:col-start-1 lg:row-start-1">
          <AvisoUmbral conteo={conteo} />

          <section aria-labelledby="texto-peticion" className="space-y-3">
            <h2 id="texto-peticion" className="text-xl font-bold tracking-tight">
              Qué se pide
            </h2>
            <p className="text-lg leading-relaxed">{peticion.texto}</p>
          </section>

          <DesgloseDistritos desglose={desglose} />

          {/* Aquí va <MapaFirmas>: sección "Firmas por sección". */}

          <section
            aria-labelledby="registro-publico"
            className="space-y-3 rounded-xl border border-dashed p-5 text-sm"
          >
            <h2 id="registro-publico" className="font-semibold">
              Registro público
            </h2>
            <p className="text-muted-foreground">
              Cada firma entra a un registro de solo adición. Con tu comprobante puedes{" "}
              <Link href="/verificar" className="font-medium text-primary underline">
                verificar
              </Link>{" "}
              que tu firma está en él.
            </p>
            <dl className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-6">
              <div className="contents">
                <dt className="font-medium">Raíz del registro</dt>
                <dd className="font-mono text-xs break-all text-muted-foreground">{raiz.hash}</dd>
              </div>
              <div className="contents">
                <dt className="font-medium">Firmas en el árbol</dt>
                <dd className="text-muted-foreground tabular-nums">{raiz.tamano_arbol}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </article>
  );
}
