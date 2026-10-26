import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { DescargarComprobante } from "@/components/descargar-comprobante";
import { EnlaceBoton } from "@/components/enlace-boton";
import { HashCopiable } from "@/components/hash-copiable";
import { obtenerComprobante } from "@/lib/consulta-comprobante";

export const metadata: Metadata = { title: "Comprobante · Rogatio" };

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

// Sin generateStaticParams: el comprobante se lee de la base en cada visita, nunca en el build.
export default function PaginaComprobante({ params }: PageProps<"/comprobante/[id]">) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Comprobante de firma</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando comprobante…</p>}>
        {params.then(({ id }) => (
          <ContenidoComprobante id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function ContenidoComprobante({ id }: { id: string }) {
  await connection();
  const datos = await obtenerComprobante(id);
  if (!datos) notFound();

  const { comprobante, tituloPeticion, firmadaEn, bloqueBitcoin } = datos;
  const urlOts = `/peticion/${comprobante.peticion}/ots/${comprobante.tamano}`;

  return (
    <div className="space-y-5">
      <p className="leading-relaxed text-muted-foreground">
        Este comprobante prueba que tu firma está en el registro público de la petición. No
        contiene tu nombre ni tu CURP. Descárgalo y verifícalo cuando quieras, sin confiar en
        Rogatio.
      </p>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-4 border-b bg-emerald-50 px-5 py-4 text-emerald-950 sm:px-6 dark:bg-emerald-950/30 dark:text-emerald-100">
          <CircleCheck aria-hidden className="size-8 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold">Tu firma quedó en el registro</p>
            <p className="text-sm">
              <Link href={`/peticion/${comprobante.peticion}`} className="underline">
                {tituloPeticion}
              </Link>
            </p>
          </div>
        </div>
        <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-3 sm:px-6">
          <div>
            <dt className="text-muted-foreground">Número de firma</dt>
            <dd className="text-4xl font-bold tracking-tight tabular-nums">
              {comprobante.secuencia}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Firmas en el árbol</dt>
            <dd className="font-medium tabular-nums">{comprobante.tamano}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium">{formatoFecha.format(new Date(firmadaEn))}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Hash de tu firma (hoja)</dt>
            <dd>
              <HashCopiable hash={comprobante.hoja} etiqueta="hash de la hoja" />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Raíz del registro</dt>
            <dd>
              <HashCopiable hash={comprobante.raiz} etiqueta="raíz del registro" />
            </dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-muted-foreground">Anclaje en Bitcoin</dt>
            <dd className="font-medium">
              {bloqueBitcoin === null
                ? "Pendiente. La raíz se envió a OpenTimestamps y se ancla en Bitcoin en unas horas."
                : `Anclada en el bloque ${bloqueBitcoin}.`}{" "}
              <a href={urlOts} className="text-primary underline">
                Descargar prueba (.ots)
              </a>
            </dd>
          </div>
        </dl>
        <details className="border-t px-5 py-4 text-sm sm:px-6">
          <summary className="cursor-pointer font-medium">
            Prueba de inclusión ({comprobante.prueba.length} hashes)
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-xs break-all text-muted-foreground">
            {comprobante.prueba.map((hash, i) => (
              <li key={i}>{hash}</li>
            ))}
          </ol>
        </details>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <DescargarComprobante comprobante={comprobante} />
        <EnlaceBoton href="/verificar" variant="outline" className="h-11 w-full px-5 text-base sm:w-auto">
          <ShieldCheck aria-hidden />
          Verificar un comprobante
        </EnlaceBoton>
      </div>
    </div>
  );
}
