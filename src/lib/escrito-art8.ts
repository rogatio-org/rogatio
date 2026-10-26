// Escrito de petición del Art. 8 (simulado). Isomórfico: no lee la base.
import { idComprobante } from "./comprobante";
import type { DatosEscrito, PeticionDemo } from "./peticion-demo";

// Provisional: borrador base de #26. Se cambia por la versión congelada de #31 (#37).
export const ESTADO_PLANTILLA = "provisional" as const;

export const MARCA_SIMULACION = "SIMULACIÓN – NO ENVIADO";

export type SeccionPlantilla = { id: string; titulo?: string; plantilla: string };

export const PLANTILLA_ESCRITO: SeccionPlantilla[] = [
  {
    id: "destinatario",
    plantilla: "{destinatario}\n{oficialia}\nP R E S E N T E",
  },
  {
    id: "proemio",
    plantilla:
      "{representante_comun}, por mi propio derecho y como representante común de las " +
      "{numero_firmantes} personas firmantes, cuya relación se anexa, señalo como domicilio " +
      "para oír y recibir notificaciones el ubicado en {domicilio_notificaciones} y como correo " +
      "electrónico {correo_notificaciones}. Con fundamento en el artículo 8 de la Constitución " +
      "Política de los Estados Unidos Mexicanos y en los artículos 33, 43, 44 y 46 de la Ley de " +
      "Procedimiento Administrativo de la Ciudad de México [por cotejar], respetuosamente expongo:",
  },
  {
    id: "hechos",
    titulo: "HECHOS",
    plantilla:
      "1. {hechos}\n" +
      "2. {numero_firmantes} personas con domicilio en la alcaldía {alcaldia} firmaron esta " +
      "petición en Rogatio entre el {fecha_inicio} y el {fecha}. Cada firma tiene un comprobante " +
      "público que se puede verificar en {url_verificacion}. La raíz del registro de las " +
      "{numero_firmantes} firmas es {raiz_registro}.",
  },
  { id: "competencia", titulo: "COMPETENCIA", plantilla: "{fundamento}" },
  {
    id: "peticion",
    titulo: "PETICIÓN",
    plantilla: "Por lo expuesto, respetuosamente pido:\n{puntos_petitorios}",
  },
  { id: "copias", plantilla: "C.c.p. {copias}" },
  { id: "lugar_fecha", plantilla: "Ciudad de México, a {fecha}." },
  {
    id: "firma",
    plantilla: "_______________________________\n{representante_comun}\nRepresentante común",
  },
  {
    id: "anexo",
    titulo: "ANEXO. RELACIÓN DE PERSONAS FIRMANTES",
    plantilla: "{anexo_firmantes}",
  },
];

// Campos que llena quien llama. numero_firmantes y anexo_firmantes salen de la lista de firmantes.
export const CAMPOS = [
  "destinatario",
  "oficialia",
  "representante_comun",
  "domicilio_notificaciones",
  "correo_notificaciones",
  "hechos",
  "alcaldia",
  "fecha_inicio",
  "fecha",
  "url_verificacion",
  "raiz_registro",
  "fundamento",
  "puntos_petitorios",
  "copias",
] as const;

export type Campo = (typeof CAMPOS)[number];
export type CamposEscrito = Record<Campo, string>;

export type Firmante = { numero: number; nombre: string; comprobante: string };

export type SeccionEscrito = { id: string; titulo?: string; texto: string };

export type EscritoLleno = {
  secciones: SeccionEscrito[];
  texto: string;
  firmantes: Firmante[];
};

/** Llena la plantilla. Lanza un error si queda un campo sin llenar. */
export function llenarEscrito(datos: CamposEscrito, firmantes: Firmante[]): EscritoLleno {
  if (firmantes.length === 0) throw new Error("El escrito necesita al menos una firma");
  const valores: Record<string, string | undefined> = {
    ...datos,
    numero_firmantes: String(firmantes.length),
    anexo_firmantes: firmantes
      .map((f) => `${f.numero}. ${f.nombre} · comprobante ${f.comprobante}`)
      .join("\n"),
  };

  const secciones = PLANTILLA_ESCRITO.map(({ id, titulo, plantilla }) => {
    const texto = plantilla.replace(/\{([a-z_]+)\}/g, (_, campo: string) => {
      const valor = valores[campo];
      if (valor === undefined || valor.trim() === "") {
        throw new Error(`Campo sin llenar en el escrito: {${campo}}`);
      }
      return valor;
    });
    return { id, titulo, texto };
  });

  const texto = secciones
    .map(({ titulo, texto }) => (titulo ? `${titulo}\n${texto}` : texto))
    .join("\n\n");
  return { secciones, texto, firmantes };
}

/** Firmantes ficticios, con los mismos nombres que scripts/semilla.ts. */
export function firmantesFicticios(slug: string, total: number): Firmante[] {
  return Array.from({ length: total }, (_, i) => ({
    numero: i + 1,
    nombre: `Persona ficticia ${String(i + 1).padStart(2, "0")}`,
    comprobante: idComprobante(slug, i + 1),
  }));
}

// Categorías verificadas de la alcaldía (docs/arquitectura/02-enrutamiento.md, secc. 2.3 y 3).
const LOA = "Ley Orgánica de Alcaldías de la Ciudad de México";
const FUNDAMENTO_POR_CATEGORIA: Record<string, string> = {
  alumbrado: `El alumbrado público es una facultad exclusiva de la alcaldía (${LOA}, art. 32 fr. IV).`,
  basura: `La limpia y la recolección de basura son una facultad exclusiva de la alcaldía (${LOA}, art. 32 fr. IV).`,
  mercados: `La regulación de los mercados es una facultad exclusiva de la alcaldía (${LOA}, art. 32 fr. IV).`,
  parques: `Construir y mantener los espacios públicos a su cargo es una facultad exclusiva de la alcaldía (${LOA}, art. 34 fr. VI).`,
  baches: `La rehabilitación y el mantenimiento de vialidades secundarias, guarniciones y banquetas son una facultad exclusiva de la alcaldía (${LOA}, arts. 32 fr. IV y 33).`,
};

/** Fundamento de competencia de la categoría, o null si la categoría no está verificada. */
export function fundamentoDe(categoria: string): string | null {
  return FUNDAMENTO_POR_CATEGORIA[categoria] ?? null;
}

const ORDINALES = ["PRIMERO", "SEGUNDO", "TERCERO", "CUARTO", "QUINTO"];
const PUNTO_RESPUESTA =
  "Que se dé respuesta por escrito, en breve término, en el domicilio y el correo señalados.";

/** Puntos petitorios numerados; el último siempre pide la respuesta por escrito. */
export function puntosPetitorios(puntos: string[]): string {
  const todos = [...puntos, PUNTO_RESPUESTA];
  if (todos.length > ORDINALES.length) throw new Error("Demasiados puntos petitorios");
  return todos.map((punto, i) => `${ORDINALES[i]}. ${punto}`).join("\n");
}

export type DistritoFirmantes = { nombre: string; firmantes: number };

/** Copias: Concejo y diputación local de cada distrito de los firmantes (03-representantes, secc. 4). */
export function copiasDelEscrito(
  alcaldia: string,
  distritos: DistritoFirmantes[],
  total: number,
): string {
  return [
    `Concejo de la Alcaldía ${alcaldia}`,
    ...distritos.map(
      (d) =>
        `Diputación del ${d.nombre}, Congreso de la Ciudad de México (${d.firmantes} de ${total} personas firmantes)`,
    ),
  ].join("; ");
}

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Mexico_City",
});

export function formatearFecha(fecha: Date | string): string {
  return formatoFecha.format(new Date(fecha));
}

/** Umbral alcanzado: solo entonces existe el escrito. */
export function escritoDisponible({ firmas, umbral }: PeticionDemo["conteo"]): boolean {
  return firmas >= umbral;
}

/** Arma los campos con la petición, los datos del escrito y las copias. Un dato ausente queda vacío. */
export function camposDesdePeticion({
  peticion,
  escrito,
  distritos,
  fecha,
  urlVerificacion,
}: {
  peticion: PeticionDemo;
  escrito: DatosEscrito;
  distritos: DistritoFirmantes[];
  fecha: Date;
  urlVerificacion: string;
}): CamposEscrito {
  const alcaldia = peticion.peticion.jurisdiccion.nombre;
  return {
    destinatario: escrito.destinatario,
    oficialia: escrito.oficialia,
    representante_comun: escrito.representante_comun,
    domicilio_notificaciones: escrito.domicilio_notificaciones,
    correo_notificaciones: escrito.correo_notificaciones,
    hechos: escrito.hechos,
    alcaldia,
    fecha_inicio: formatearFecha(peticion.peticion.creada_en),
    fecha: formatearFecha(fecha),
    url_verificacion: urlVerificacion,
    raiz_registro: peticion.raiz.hash,
    fundamento: fundamentoDe(peticion.peticion.categoria) ?? "",
    puntos_petitorios: escrito.puntos_petitorios.length
      ? puntosPetitorios(escrito.puntos_petitorios)
      : "",
    copias: copiasDelEscrito(alcaldia, distritos, peticion.conteo.firmas),
  };
}
