"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { colorDeFirmas, type FirmasSeccion } from "@/lib/mapa-colores";

const GEOJSON = "/datos/secciones-cuauhtemoc.geojson";
const ATRIBUCION_INE = "Secciones: INE, Marco Geográfico Electoral";

type PropiedadesSeccion = { seccion: number };

export default function MapaLeaflet({ secciones }: { secciones: FirmasSeccion[] }) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current) return;
    const firmasPorSeccion = new Map(secciones.map((s) => [s.seccion, s.firmas]));
    const mapa = L.map(contenedor.current, {
      scrollWheelZoom: false,
      center: [19.4285, -99.1475],
      zoom: 13,
      zoomAnimation: false,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);
    // Fondo en gris tenue para que resalten las secciones.
    mapa.getPane("tilePane")!.style.filter = "grayscale(1) opacity(0.55)";
    mapa.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    mapa.attributionControl.addAttribution(ATRIBUCION_INE);

    const control = new AbortController();
    fetch(GEOJSON, { signal: control.signal })
      .then((r) => r.json())
      .then((datos: GeoJSON.FeatureCollection<GeoJSON.Polygon, PropiedadesSeccion>) => {
        const capa = L.geoJSON(datos, {
          style: (f) => {
            const n = firmasPorSeccion.get(f?.properties.seccion);
            const color = n === undefined ? null : colorDeFirmas(n);
            return {
              color: color ? "#1e3a8a" : "#64748b",
              weight: color ? 1 : 0.5,
              opacity: color ? 0.9 : 0.5,
              fillColor: color ?? "#ffffff",
              fillOpacity: color ? 0.75 : 0,
            };
          },
          onEachFeature: (f, capaSeccion) => {
            const n = firmasPorSeccion.get(f.properties.seccion);
            capaSeccion.bindTooltip(
              n === undefined
                ? `Sección ${f.properties.seccion}`
                : `Sección ${f.properties.seccion}: ${n} firmas`,
              { sticky: true },
            );
          },
        }).addTo(mapa);

        const conColor = L.featureGroup();
        capa.eachLayer((l) => {
          const f = (l as L.Polygon).feature as GeoJSON.Feature<GeoJSON.Polygon, PropiedadesSeccion>;
          if (firmasPorSeccion.has(f.properties.seccion)) conColor.addLayer(l);
        });
        const limites = conColor.getLayers().length ? conColor.getBounds() : capa.getBounds();
        // Sin animación: si la página cambia a media animación, Leaflet falla con _leaflet_pos.
        mapa.fitBounds(limites, { padding: [24, 24], maxZoom: 15, animate: false });
      })
      .catch(() => {});

    return () => {
      control.abort();
      mapa.remove();
    };
  }, [secciones]);

  return (
    <div
      ref={contenedor}
      role="img"
      aria-label="Mapa de las secciones electorales de Cuauhtémoc coloreadas por número de firmas"
      className="isolate h-80 w-full overflow-hidden rounded-lg border bg-muted sm:h-96"
    />
  );
}
