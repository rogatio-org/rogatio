import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { BotonImprimir } from "@/components/boton-imprimir";
import { DocumentoEscrito } from "@/components/documento-escrito";
import { EnlaceBoton } from "@/components/enlace-boton";
import { obtenerPeticion } from "@/lib/consultas";
import {
  ESTADO_PLANTILLA,
  camposDesdePeticion,
  escritoDisponible,
  firmantesFicticios,
  llenarEscrito,
  type EscritoLleno,
} from "@/lib/escrito-art8";
import { datosEscritoDe } from "@/lib/peticion-demo";

export const metadata: Metadata = { title: "Escrito del Art. 8 · Rogatio" };

// Igual que la página de la petición: se lee de la base en cada visita, nunca en el build.
export default function Escrito({ params }: PageProps<"/peticion/[id]/escrito">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando escrito…</p>}>
      {params.then(({ id }) => (
        <ContenidoEscrito id={id} />
      ))}
    </Suspense>
  );
}

async function ContenidoEscrito({ id }: { id: string }) {
  await connection();
  const datos = await obtenerPeticion(id);
  if (!datos) notFound();
  const volver = `/peticion/${id}`;

  if (!escritoDisponible(datos.conteo)) {
    return (
      <Aviso titulo="El escrito se genera al llegar al umbral" volver={volver}>
        Van {datos.conteo.firmas} de {datos.conteo.umbral} firmas. Al llegar a{" "}
        {datos.conteo.umbral}, Rogatio genera aquí el escrito de petición del Art. 8.
      </Aviso>
    );
  }

  const escrito = datosEscritoDe(id);
  if (!escrito) {
    return (
      <Aviso titulo="Esta petición aún no tiene escrito" volver={volver}>
        Faltan el representante común y los datos para notificaciones.
      </Aviso>
    );
  }

  let lleno: EscritoLleno;
  try {
    lleno = llenarEscrito(
      camposDesdePeticion({
        peticion: datos,
        escrito,
        fecha: new Date(),
      }),
      firmantesFicticios(id, datos.conteo.firmas),
    );
  } catch (error) {
    return (
      <Aviso titulo="No se pudo generar el escrito" volver={volver}>
        {error instanceof Error ? error.message : "Falta un dato."} Por ejemplo, la categoría puede
        tener la competencia por verificar.
      </Aviso>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 print:hidden">
        <h1 className="text-2xl font-bold">Escrito de petición del Art. 8</h1>
        <p className="text-sm text-muted-foreground">
          Simulación: Rogatio no envía este escrito. Los datos de quien firma como representante
          común y los nombres del anexo son ficticios.
          {ESTADO_PLANTILLA === "provisional" &&
            " La plantilla es el borrador provisional de baches, pendiente de congelar (#31) y de validación legal. Lo marcado [POR VERIFICAR] sigue pendiente."}
        </p>
        <div className="flex flex-wrap gap-3">
          <BotonImprimir />
          <EnlaceBoton href={volver} variant="outline">
            Volver a la petición
          </EnlaceBoton>
        </div>
      </div>
      <DocumentoEscrito escrito={lleno} />
    </div>
  );
}

function Aviso({
  titulo,
  volver,
  children,
}: {
  titulo: string;
  volver: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="leading-relaxed">{children}</p>
      <EnlaceBoton href={volver} variant="outline">
        Volver a la petición
      </EnlaceBoton>
    </section>
  );
}
