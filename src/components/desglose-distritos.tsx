import { useId } from "react";
import { numeroDeDistrito, type DesglosePorDistrito, type FirmasDistrito } from "@/lib/desglose";

function plural(n: number) {
  return `${n} firma${n === 1 ? "" : "s"}`;
}

function ListaDistritos({
  titulo,
  distritos,
  total,
}: {
  titulo: string;
  distritos: FirmasDistrito[];
  total: number;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <h3 id={id} className="text-sm font-semibold">
        {titulo}
      </h3>
      <ul aria-labelledby={id} className="space-y-2">
        {distritos.map((d) => {
          const numero = numeroDeDistrito(d.codigo);
          return (
            <li key={d.codigo} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span title={d.nombre}>{numero === null ? d.nombre : `Distrito ${numero}`}</span>
                <span className="font-mono tabular-nums">{plural(d.firmas)}</span>
              </div>
              <div aria-hidden className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${total ? Math.round((d.firmas / total) * 100) : 0}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Solo conteos por distrito: ninguna fila lleva datos de personas.
export function DesgloseDistritos({ desglose }: { desglose: DesglosePorDistrito }) {
  const id = useId();
  const { federales, locales, sinDistrito } = desglose;
  const total = federales.reduce((s, d) => s + d.firmas, 0) + sinDistrito;

  return (
    <section aria-labelledby={id} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <h2 id={id} className="font-semibold">
          Firmas por distrito
        </h2>
        <p className="text-sm text-muted-foreground">
          Según la sección de la credencial de quien firma. Solo se publican conteos.
        </p>
      </div>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay firmas.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <ListaDistritos titulo="Distrito local" distritos={locales} total={total} />
          <ListaDistritos titulo="Distrito federal" distritos={federales} total={total} />
        </div>
      )}
      {sinDistrito > 0 && (
        <p className="text-sm text-muted-foreground">Sin distrito: {plural(sinDistrito)}.</p>
      )}
    </section>
  );
}
