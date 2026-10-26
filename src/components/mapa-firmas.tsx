import { Suspense, useId } from "react";
import { MapaSecciones } from "@/components/mapa-secciones";
import { obtenerFirmasPorSeccion } from "@/lib/mapa";
import { MINIMO_ANONIMATO, TRAMOS } from "@/lib/mapa-colores";

function plural(n: number) {
  return `${n} firma${n === 1 ? "" : "s"}`;
}

// Al cliente solo llegan pares (sección, firmas) con 5 firmas o más.
async function ContenidoMapa({ id }: { id: string }) {
  const secciones = await obtenerFirmasPorSeccion(id);
  return (
    <>
      <MapaSecciones secciones={secciones} />
      <ul aria-label="Leyenda del mapa" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {TRAMOS.map((t) => (
          <li key={t.minimo} className="flex items-center gap-2">
            <span aria-hidden className="size-4 rounded-sm border" style={{ background: t.color }} />
            {t.maximo === null ? `${t.minimo} o más` : `${t.minimo} a ${t.maximo}`}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-4 rounded-sm border border-dashed bg-background" />
          Menos de {MINIMO_ANONIMATO} o sin firmas
        </li>
      </ul>
      {secciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay secciones con {MINIMO_ANONIMATO} firmas o más.
        </p>
      ) : (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Ver secciones con color ({secciones.length})
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
            {secciones.map((s) => (
              <li key={s.seccion} className="flex justify-between gap-2">
                <span>Sección {s.seccion}</span>
                <span className="font-mono tabular-nums">{plural(s.firmas)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export function MapaFirmas({ id }: { id: string }) {
  const tituloId = useId();
  return (
    <section aria-labelledby={tituloId} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <h2 id={tituloId} className="font-semibold">
          Mapa de firmas por sección
        </h2>
        <p className="text-sm text-muted-foreground">
          Solo mostramos secciones con {MINIMO_ANONIMATO} firmas o más para proteger el anonimato.
        </p>
      </div>
      <Suspense
        fallback={<div className="h-80 animate-pulse rounded-md bg-muted sm:h-96" />}
      >
        <ContenidoMapa id={id} />
      </Suspense>
    </section>
  );
}
