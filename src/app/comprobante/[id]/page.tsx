import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comprobante de firma</h1>
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
    <div className="space-y-6">
      <p className="leading-relaxed">
        Este comprobante prueba que tu firma está en el registro público de la petición. No
        contiene tu nombre ni tu CURP. Descárgalo y verifícalo cuando quieras, sin confiar en
        Rogatio.
      </p>

      <dl className="grid gap-3 rounded-lg border p-4 text-sm">
        <div>
          <dt className="font-semibold">Petición</dt>
          <dd>
            <Link href={`/peticion/${comprobante.peticion}`} className="underline">
              {tituloPeticion}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Número de firma</dt>
          <dd className="text-2xl font-bold">{comprobante.secuencia}</dd>
        </div>
        <div>
          <dt className="font-semibold">Fecha</dt>
          <dd>{formatoFecha.format(new Date(firmadaEn))}</dd>
        </div>
        <div>
          <dt className="font-semibold">Hash de tu firma (hoja)</dt>
          <dd>
            <HashCopiable hash={comprobante.hoja} etiqueta="hash de la hoja" />
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Raíz del registro</dt>
          <dd>
            <HashCopiable hash={comprobante.raiz} etiqueta="raíz del registro" />
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Firmas en el árbol</dt>
          <dd>{comprobante.tamano}</dd>
        </div>
        <div>
          <dt className="font-semibold">Anclaje en Bitcoin</dt>
          <dd>
            {bloqueBitcoin === null
              ? "Pendiente. La raíz se envió a OpenTimestamps y se ancla en Bitcoin en unas horas."
              : `Anclada en el bloque ${bloqueBitcoin}.`}{" "}
            <a href={urlOts} className="underline">
              Descargar prueba (.ots)
            </a>
          </dd>
        </div>
      </dl>

      <details className="rounded-lg border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          Prueba de inclusión ({comprobante.prueba.length} hashes)
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono break-all">
          {comprobante.prueba.map((hash, i) => (
            <li key={i}>{hash}</li>
          ))}
        </ol>
      </details>

      <div className="flex flex-col gap-3 sm:flex-row">
        <DescargarComprobante comprobante={comprobante} />
        <EnlaceBoton href="/verificar" variant="outline" className="w-full sm:w-auto">
          Verificar un comprobante
        </EnlaceBoton>
      </div>
    </div>
  );
}
