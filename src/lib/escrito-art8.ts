// Escrito de petición del Art. 8 (simulado). Isomórfico: no lee la base.
import { idComprobante } from "./comprobante";
import type { DatosEscrito, EstadoEnvio, PeticionDemo } from "./peticion-demo";

// Provisional: borrador de baches de #31 (data/fixtures/escrito-art8-baches.txt), aún sin
// congelar. Al congelarse #31, se copia aquí la versión final (#37). Las marcas [POR VERIFICAR]
// son de ese borrador y se quedan hasta entonces.
export const ESTADO_PLANTILLA = "provisional" as const;

export const MARCA_SIMULACION = "SIMULACIÓN – NO ENVIADO";

export type SeccionPlantilla = { id: string; titulo?: string; plantilla: string };

// Mismo texto que data/fixtures/escrito-art8-baches.txt, partido en secciones para la vista.
// La prueba compara las dos versiones. {fundamento} sale de FUNDAMENTO_POR_CATEGORIA.
export const PLANTILLA_ESCRITO: SeccionPlantilla[] = [
  {
    id: "destinatario",
    plantilla:
      "PERSONA TITULAR DE LA ALCALDÍA CUAUHTÉMOC\n" +
      "Oficialía de Partes: Aldama y Mina sin número, colonia Buenavista, C.P. 06350, Ciudad de México " +
      "[POR VERIFICAR: C.P. 06350 o 03650; horario; forma de cortesía del cargo]\n" +
      "P r e s e n t e",
  },
  {
    id: "proemio",
    plantilla:
      "{representante_comun}, en mi carácter de representante común de las {numero_firmantes} " +
      "personas firmantes que aparecen en el Anexo 1, señalo como domicilio para recibir " +
      "notificaciones el ubicado en {domicilio_notificaciones}. {acepta_notificaciones_electronicas}: " +
      "acepto recibir notificaciones electrónicas en el correo {correo_notificaciones}. Autorizo " +
      "para oír y recibir notificaciones a {personas_autorizadas}.",
  },
  {
    id: "preambulo",
    plantilla:
      "Con fundamento en el artículo 8 de la Constitución Política de los Estados Unidos Mexicanos " +
      "y en los artículos 43 y 44 de la Ley de Procedimiento Administrativo de la Ciudad de México, " +
      "de manera pacífica y respetuosa, presento la siguiente petición.",
  },
  {
    id: "hechos",
    titulo: "HECHOS",
    plantilla:
      "1. Las personas firmantes vivimos en la alcaldía Cuauhtémoc.\n" +
      "2. La calle Mérida, en la colonia Roma Norte, tiene baches en su carpeta asfáltica. " +
      "[POR VERIFICAR: tramo exacto entre calles y estado actual en 2026]\n" +
      "3. Los baches afectan el paso seguro de vehículos, bicicletas y peatones.\n" +
      "4. La calle Mérida es una vialidad secundaria de la demarcación. No es un eje vial ni una " +
      "vía primaria. [POR VERIFICAR: clasificación oficial]",
  },
  {
    id: "fundamento",
    titulo: "FUNDAMENTO",
    plantilla:
      "{fundamento}\n\n" +
      "[POR VERIFICAR: cotejar ambos artículos con la reforma de la LOA del 06-10-2023]",
  },
  {
    id: "peticion",
    titulo: "PETICIÓN",
    plantilla:
      "Por lo expuesto, solicito respetuosamente:\n\n" +
      "PRIMERO. Que la Alcaldía repare todos los baches de la calle Mérida, colonia Roma Norte, " +
      "en un plazo de 60 días naturales.\n" +
      "SEGUNDO. Que la Alcaldía informe por escrito el número de baches reparados, las fechas de " +
      "los trabajos y el tramo atendido.\n" +
      "TERCERO. Que la Alcaldía responda por escrito y en breve término, en el domicilio o el " +
      "correo que señalo, conforme al artículo 8 constitucional.",
  },
  { id: "atentamente", plantilla: "ATENTAMENTE" },
  { id: "lugar_fecha", plantilla: "Ciudad de México, a {fecha}" },
  {
    id: "firma",
    plantilla: "{firma_representante}\n{representante_comun}\nRepresentante común",
  },
  {
    // Sin título: la primera línea es el encabezado del anexo y la segunda la raíz.
    id: "anexo",
    plantilla:
      "ANEXO 1. Personas firmantes ({numero_firmantes})\n" +
      "Raíz del registro de firmas: {raiz_hash}\n" +
      "{anexo_firmantes}\n" +
      "(Columnas: núm., nombre, sección electoral, firma o folio de verificación.)",
  },
];

// Campos que llena quien llama. numero_firmantes y anexo_firmantes salen de la lista de firmantes.
export const CAMPOS = [
  "representante_comun",
  "domicilio_notificaciones",
  "correo_notificaciones",
  "acepta_notificaciones_electronicas",
  "personas_autorizadas",
  "fundamento",
  "fecha",
  "firma_representante",
  "raiz_hash",
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
    .map(({ titulo, texto }) => (titulo ? `${titulo}\n\n${texto}` : texto))
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
  // Texto del borrador de #31 (docs/contenido-demo/baches.md).
  "vialidad.secundaria.bache":
    `El artículo 32, fracción IV, de la ${LOA} dice que es atribución exclusiva de la persona ` +
    `titular de la Alcaldía "prestar los siguientes servicios públicos: [...] pavimentación, de ` +
    `conformidad con la normatividad aplicable".\n\n` +
    `El artículo 33 de la misma ley dice: "Es responsabilidad de las Alcaldías, rehabilitar y ` +
    `mantener las vialidades, así como las guarniciones y banquetas requeridas en su demarcación".`,
  baches: `La rehabilitación y el mantenimiento de vialidades secundarias, guarniciones y banquetas son una facultad exclusiva de la alcaldía (${LOA}, arts. 32 fr. IV y 33).`,
};

/** Fundamento de competencia de la categoría, o null si la categoría no está verificada. */
export function fundamentoDe(categoria: string): string | null {
  return FUNDAMENTO_POR_CATEGORIA[categoria] ?? null;
}

export type DistritoFirmantes = { nombre: string; firmantes: number };

// Sin uso: el borrador de #31 no lleva C.c.p. Se queda por si la versión congelada lo pide.
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

/** Sin registro de envío, el escrito cuenta como generado al llegar al umbral. */
export function estadoEnvioVisible(
  estado: EstadoEnvio,
  conteo: PeticionDemo["conteo"],
): EstadoEnvio {
  return estado === "pendiente" && escritoDisponible(conteo) ? "generado" : estado;
}

/** Arma los campos con la petición y los datos ficticios del escrito. Un dato ausente queda vacío. */
export function camposDesdePeticion({
  peticion,
  escrito,
  fecha,
}: {
  peticion: PeticionDemo;
  escrito: DatosEscrito;
  fecha: Date;
}): CamposEscrito {
  return {
    representante_comun: escrito.representante_comun,
    domicilio_notificaciones: escrito.domicilio_notificaciones,
    correo_notificaciones: escrito.correo_notificaciones,
    acepta_notificaciones_electronicas: escrito.acepta_notificaciones_electronicas,
    personas_autorizadas: escrito.personas_autorizadas,
    fundamento: fundamentoDe(peticion.peticion.categoria) ?? "",
    fecha: formatearFecha(fecha),
    firma_representante: escrito.firma_representante,
    raiz_hash: peticion.raiz.hash,
  };
}
