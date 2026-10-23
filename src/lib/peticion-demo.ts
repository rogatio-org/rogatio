import datos from "../../data/fixtures/peticion-demo.json";

// Contrato de datos de la petición de la demo. Aún no se lee la base de datos.

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
  };
  conteo: { firmas: number; umbral: number };
  raiz: { hash: string; tamano_arbol: number; publicada_en: string };
  envio: {
    estado: EstadoEnvio;
    simulado: true;
    enviado_en: string | null;
    acuse_hash: string | null;
  };
};

export const peticionDemo = datos as PeticionDemo;

export function obtenerPeticionDemo(id: string): PeticionDemo | null {
  return id === peticionDemo.peticion.id ? peticionDemo : null;
}

export function porcentajeDelUmbral({ firmas, umbral }: PeticionDemo["conteo"]) {
  return Math.min(100, Math.round((firmas / umbral) * 100));
}
