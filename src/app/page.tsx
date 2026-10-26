import { FileCheck, FileText, IdCard } from "lucide-react";
import { EnlaceBoton } from "@/components/enlace-boton";
import { Badge } from "@/components/ui/badge";
import { peticionDemo } from "@/lib/peticion-demo";

const pasos = [
  {
    icono: IdCard,
    titulo: "Firma con tu credencial",
    texto:
      "Tu credencial del INE acredita que vives donde aplica la petición. Cada persona firma una sola vez.",
  },
  {
    icono: FileCheck,
    titulo: "Recibe un comprobante",
    texto:
      "Tu firma entra a un registro público. Con tu comprobante verificas que está ahí, sin confiar en Rogatio.",
  },
  {
    icono: FileText,
    titulo: "La autoridad recibe el escrito",
    texto:
      "Al llegar al umbral, Rogatio redacta la petición formal del Art. 8 de la Constitución para la autoridad.",
  },
] as const;

export default function Inicio() {
  const { peticion } = peticionDemo;
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <Badge variant="secondary" className="h-6 px-3 text-sm">
          Peticiones ciudadanas verificadas para México
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Rogatio</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Junta firmas verificadas para pedirle algo concreto a tu autoridad. Cada firma se acredita
          con la credencial del INE y deja un comprobante que cualquiera puede revisar.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <EnlaceBoton href={`/peticion/${peticion.id}`} className="h-11 px-5 text-base">
            Ver la petición de ejemplo
          </EnlaceBoton>
          <EnlaceBoton href="/verificar" variant="outline" className="h-11 px-5 text-base">
            Verificar un comprobante
          </EnlaceBoton>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="space-y-5">
        <h2 id="como-funciona" className="text-2xl font-bold tracking-tight">
          Cómo funciona
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="space-y-3 rounded-xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <Icono aria-hidden className="size-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{titulo}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border bg-secondary p-5 sm:p-6">
        <p className="text-sm font-semibold text-secondary-foreground">Petición de ejemplo</p>
        <p className="mt-1 text-lg font-semibold">{peticion.titulo}</p>
        <p className="mt-1 text-sm text-muted-foreground">Para la {peticion.autoridad}</p>
      </section>
    </div>
  );
}
