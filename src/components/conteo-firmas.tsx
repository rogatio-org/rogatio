import { porcentajeDelUmbral, type PeticionDemo } from "@/lib/peticion-demo";

export function ConteoFirmas({ conteo }: { conteo: PeticionDemo["conteo"] }) {
  const porcentaje = porcentajeDelUmbral(conteo);
  const faltan = Math.max(0, conteo.umbral - conteo.firmas);

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold">
        {conteo.firmas} <span className="text-base font-normal">de {conteo.umbral} firmas</span>
      </p>
      <div
        role="progressbar"
        aria-label="Firmas contra el umbral"
        aria-valuemin={0}
        aria-valuemax={conteo.umbral}
        aria-valuenow={conteo.firmas}
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-sm text-muted-foreground">
        {faltan === 0
          ? "Se alcanzó el umbral."
          : `Falta${faltan === 1 ? "" : "n"} ${faltan} firma${faltan === 1 ? "" : "s"} para el umbral.`}
      </p>
    </div>
  );
}
