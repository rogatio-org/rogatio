import datos from "../../data/fixtures/peticion-demo.json";
import type { EstadoPeticion } from "./estado-peticion";

// Contrato de datos de la petición. La página la lee de la base con obtenerPeticion (src/lib/consultas.ts).

// Mismos valores que el enum estado_envio de src/db/esquema.ts.
export type EstadoEnvio = "pendiente" | "generado" | "enviado_simulado" | "fallido";

export type PeticionDemo = {
  peticion: {
    id: string;
    titulo: string;
    texto: string;
    categoria: string;
    jurisdiccion: { nivel: string; codigo: string; nombre: string };
    autoridad: string;
    ubicacion: string;
    creada_en: string;
    // Solo viene de la base; el fixture no lo trae.
    estado?: EstadoPeticion;
  };
  conteo: { firmas: number; umbral: number };
  raiz: { hash: string; tamano_arbol: number; publicada_en: string };
  envio: {
    estado: EstadoEnvio;
    simulado: true;
    enviado_en: string | null;
    acuse_hash: string | null;
  };
  // Datos ficticios del escrito del Art. 8. Solo en el fixture; la base aún no los guarda.
  escrito?: DatosEscrito;
};

export type DatosEscrito = {
  representante_comun: string;
  domicilio_notificaciones: string;
  correo_notificaciones: string;
  // "Sí" o "No". Ficticio hasta que lo decida quien firme.
  acepta_notificaciones_electronicas: string;
  // Ficticio o "(por confirmar)".
  personas_autorizadas: string;
  firma_representante: string;
};

export const peticionDemo = datos as PeticionDemo;

/** Datos del escrito para un slug. Solo la petición de la demo los tiene. */
export function datosEscritoDe(id: string): DatosEscrito | null {
  return id === peticionDemo.peticion.id ? (peticionDemo.escrito ?? null) : null;
}

export function obtenerPeticionDemo(id: string): PeticionDemo | null {
  return id === peticionDemo.peticion.id ? peticionDemo : null;
}

export function porcentajeDelUmbral({ firmas, umbral }: PeticionDemo["conteo"]) {
  return Math.min(100, Math.round((firmas / umbral) * 100));
}
