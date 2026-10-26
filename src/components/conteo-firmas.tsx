import { Progress } from "@/components/ui/progress";
import { porcentajeDelUmbral, type PeticionDemo } from "@/lib/peticion-demo";

export function ConteoFirmas({ conteo }: { conteo: PeticionDemo["conteo"] }) {
  const porcentaje = porcentajeDelUmbral(conteo);
  const faltan = Math.max(0, conteo.umbral - conteo.firmas);

  return (
    <div className="space-y-3">
      <p className="flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight tabular-nums">{conteo.firmas}</span>
        <span className="text-lg text-muted-foreground">de {conteo.umbral} firmas</span>
        <span className="ml-auto text-sm font-semibold tabular-nums">{porcentaje} %</span>
      </p>
      <Progress
        aria-label="Firmas contra el umbral"
        value={Math.min(conteo.firmas, conteo.umbral)}
        max={conteo.umbral}
        className="[&_[data-slot=progress-track]]:h-3"
      />
      <p className="text-sm font-medium">
        {faltan === 0
          ? "Se alcanzó el umbral."
          : `Falta${faltan === 1 ? "" : "n"} ${faltan} firma${faltan === 1 ? "" : "s"} para el umbral.`}
      </p>
    </div>
  );
}
