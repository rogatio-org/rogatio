"use client";

import dynamic from "next/dynamic";
import type { FirmasSeccion } from "@/lib/mapa-colores";

// Leaflet usa window: se carga solo en el navegador y en su propio chunk.
const MapaLeaflet = dynamic(() => import("@/components/mapa-leaflet"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-md bg-muted sm:h-96" />,
});

export function MapaSecciones({ secciones }: { secciones: FirmasSeccion[] }) {
  return <MapaLeaflet secciones={secciones} />;
}
