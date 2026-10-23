import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConteoFirmas } from "@/components/conteo-firmas";
import { EnlaceBoton } from "@/components/enlace-boton";
import { PorConstruir } from "@/components/por-construir";
import { obtenerPeticionDemo, peticionDemo } from "@/lib/peticion-demo";

const textoEstadoEnvio = {
  pendiente: "Pendiente: aún no se alcanza el umbral.",
  generado: "Petición del Art. 8 generada.",
  enviado_simulado: "Enviada (simulación).",
  fallido: "No se pudo generar el envío.",
} as const;

export function generateStaticParams() {
  return [{ id: peticionDemo.peticion.id }];
}

export async function generateMetadata({
  params,
}: PageProps<"/peticion/[id]">): Promise<Metadata> {
  const { id } = await params;
  const datos = obtenerPeticionDemo(id);
  return { title: datos ? `${datos.peticion.titulo} · Rogatio` : "Rogatio" };
}

export default async function Peticion({ params }: PageProps<"/peticion/[id]">) {
  const { id } = await params;
  const datos = obtenerPeticionDemo(id);
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
          <dd>{textoEstadoEnvio[envio.estado]}</dd>
        </div>
      </dl>

      <PorConstruir
        titulo="Tablero del umbral"
        tareas={[
          "Leer el conteo de firmas desde la base de datos en lugar del fixture.",
          "Mostrar el avance hacia el umbral y el desglose por distrito.",
          "Al llegar al umbral, habilitar la generación del PDF del Art. 8 (simulado).",
        ]}
      />
    </article>
  );
}
