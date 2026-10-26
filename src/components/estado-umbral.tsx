import { CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EstadoEnvio as Estado, PeticionDemo } from "@/lib/peticion-demo";

export function umbralAlcanzado({ firmas, umbral }: PeticionDemo["conteo"]) {
  return firmas >= umbral;
}

// Aviso del tablero cuando la petición llega al umbral.
export function AvisoUmbral({ conteo }: { conteo: PeticionDemo["conteo"] }) {
  if (!umbralAlcanzado(conteo)) return null;
  return (
    <section
      role="status"
      className="flex gap-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 text-emerald-950 sm:p-5 dark:bg-emerald-950/30 dark:text-emerald-100"
    >
      <CircleCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-emerald-700" />
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Umbral alcanzado</h2>
        <p>
          La petición juntó {conteo.firmas} de {conteo.umbral} firmas verificadas y ya no recibe
          más. El siguiente paso es el escrito del Art. 8 para la autoridad (simulado).
        </p>
      </div>
    </section>
  );
}

const textoEstado: Record<Estado, string> = {
  pendiente: "Pendiente: aún no se alcanza el umbral.",
  generado: "Escrito del Art. 8 generado.",
  enviado_simulado: "Envío simulado a la autoridad.",
  fallido: "No se pudo generar el envío.",
};

// El envío de la demo siempre es simulado y así se dice.
export function EstadoEnvio({
  envio,
  conteo,
}: {
  envio: PeticionDemo["envio"];
  conteo: PeticionDemo["conteo"];
}) {
  const texto =
    envio.estado === "pendiente" && umbralAlcanzado(conteo)
      ? "Pendiente: falta generar el escrito del Art. 8."
      : textoEstado[envio.estado];
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-medium">{texto}</span>
      <Badge
        variant="outline"
        className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-transparent dark:text-amber-200"
      >
        Simulación: nada se envía de verdad
      </Badge>
    </span>
  );
}
