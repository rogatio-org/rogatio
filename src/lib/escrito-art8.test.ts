import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CAMPOS,
  MARCA_SIMULACION,
  PLANTILLA_ESCRITO,
  camposDesdePeticion,
  copiasDelEscrito,
  escritoDisponible,
  estadoEnvioVisible,
  firmantesFicticios,
  formatearFecha,
  fundamentoDe,
  llenarEscrito,
  type CamposEscrito,
} from "./escrito-art8";
import { peticionDemo } from "./peticion-demo";

const escrito = peticionDemo.escrito!;
const distritos = [
  { nombre: "Distrito local 9 de la Ciudad de México", firmantes: 24 },
  { nombre: "Distrito local 12 de la Ciudad de México", firmantes: 26 },
];

function camposDemo(): CamposEscrito {
  return camposDesdePeticion({
    peticion: { ...peticionDemo, conteo: { firmas: 50, umbral: 50 } },
    escrito,
    fecha: new Date("2026-10-26T18:00:00Z"),
  });
}

describe("escrito del Art. 8", () => {
  it("la plantilla usa todos los campos", () => {
    const plantilla = PLANTILLA_ESCRITO.map((s) => s.plantilla).join("\n");
    for (const campo of [...CAMPOS, "numero_firmantes", "anexo_firmantes"]) {
      expect(plantilla).toContain(`{${campo}}`);
    }
  });

  it("llena todos los campos", () => {
    const { texto, secciones } = llenarEscrito(camposDemo(), firmantesFicticios("peticion-demo", 50));
    expect(texto).not.toMatch(/\{[a-z_]+\}/);
    expect(texto).toContain("Persona Ficticia Uno, en mi carácter de representante común");
    expect(texto).toContain("representante común de las 50 personas firmantes");
    expect(texto).toContain("notificaciones@example.org");
    expect(texto).toContain("PERSONA TITULAR DE LA ALCALDÍA CUAUHTÉMOC");
    expect(texto).toContain("calle Mérida, colonia Roma Norte");
    expect(texto).toContain("Autorizo para oír y recibir notificaciones a (por confirmar).");
    expect(texto).toContain("rehabilitar y mantener las vialidades");
    expect(texto).toContain("Ciudad de México, a 26 de octubre de 2026");
    expect(texto).toContain(`Raíz del registro de firmas: ${peticionDemo.raiz.hash}`);
    expect(secciones.map((s) => s.id)).toEqual(PLANTILLA_ESCRITO.map((s) => s.id));
  });

  it("es igual a la plantilla de baches de data/fixtures", () => {
    const firmantes = firmantesFicticios("peticion-demo", 50);
    const campos = camposDemo();
    const { texto, secciones } = llenarEscrito(campos, firmantes);
    const anexo = secciones.find((s) => s.id === "anexo")!.texto.split("\n").slice(2, 52);
    const valores: Record<string, string> = {
      ...campos,
      numero_firmantes: "50",
      anexo_firmantes: anexo.join("\n"),
    };
    const archivo = readFileSync("data/fixtures/escrito-art8-baches.txt", "utf8");
    const esperado = archivo.replace(/\{([a-z_]+)\}/g, (_, campo: string) => valores[campo]);
    expect(texto).toBe(esperado.trim());
  });

  it("el anexo tiene 50 nombres ficticios con su comprobante", () => {
    const { secciones, firmantes } = llenarEscrito(
      camposDemo(),
      firmantesFicticios("peticion-demo", 50),
    );
    const anexo = secciones.find((s) => s.id === "anexo")!.texto.split("\n").slice(2, -1);
    expect(anexo).toHaveLength(50);
    expect(firmantes).toHaveLength(50);
    expect(anexo[0]).toBe("1. Persona ficticia 01 · comprobante peticion-demo-1");
    expect(anexo[49]).toBe("50. Persona ficticia 50 · comprobante peticion-demo-50");
  });

  it("lanza error si falta un campo", () => {
    const incompletos: Partial<CamposEscrito> = camposDemo();
    delete incompletos.correo_notificaciones;
    expect(() =>
      llenarEscrito(incompletos as CamposEscrito, firmantesFicticios("peticion-demo", 50)),
    ).toThrow("{correo_notificaciones}");
  });

  it("lanza error si un campo está vacío", () => {
    expect(() =>
      llenarEscrito({ ...camposDemo(), fundamento: "" }, firmantesFicticios("peticion-demo", 50)),
    ).toThrow("{fundamento}");
  });

  it("lanza error sin firmantes", () => {
    expect(() => llenarEscrito(camposDemo(), [])).toThrow();
  });

  it("solo da fundamento para categorías verificadas", () => {
    expect(fundamentoDe("alumbrado")).toContain("art. 32 fr. IV");
    expect(fundamentoDe("baches")).toContain("arts. 32 fr. IV y 33");
    expect(fundamentoDe("vialidad.secundaria.bache")).toContain("El artículo 33 de la misma ley");
    expect(fundamentoDe("metro")).toBeNull();
  });

  it("copia al Concejo y a cada distrito local", () => {
    expect(copiasDelEscrito("Cuauhtémoc", distritos, 50)).toBe(
      "Concejo de la Alcaldía Cuauhtémoc; " +
        "Diputación del Distrito local 9 de la Ciudad de México, Congreso de la Ciudad de México (24 de 50 personas firmantes); " +
        "Diputación del Distrito local 12 de la Ciudad de México, Congreso de la Ciudad de México (26 de 50 personas firmantes)",
    );
  });

  it("formatea la fecha en la hora de la Ciudad de México", () => {
    expect(formatearFecha("2026-10-27T05:00:00Z")).toBe("26 de octubre de 2026");
  });

  it("solo está disponible al llegar al umbral", () => {
    expect(escritoDisponible({ firmas: 49, umbral: 50 })).toBe(false);
    expect(escritoDisponible({ firmas: 50, umbral: 50 })).toBe(true);
  });

  it("marca el envío como generado al llegar al umbral", () => {
    expect(estadoEnvioVisible("pendiente", { firmas: 49, umbral: 50 })).toBe("pendiente");
    expect(estadoEnvioVisible("pendiente", { firmas: 50, umbral: 50 })).toBe("generado");
    expect(estadoEnvioVisible("enviado_simulado", { firmas: 50, umbral: 50 })).toBe(
      "enviado_simulado",
    );
  });

  it("la marca de simulación es exacta", () => {
    expect(MARCA_SIMULACION).toBe("SIMULACIÓN – NO ENVIADO");
  });

  it("el fixture del escrito solo usa datos ficticios", () => {
    expect(escrito.representante_comun).toMatch(/ficticia/i);
    expect(escrito.correo_notificaciones).toMatch(/@example\.org$/);
    expect(escrito.domicilio_notificaciones).toContain("Ejemplo Centro");
    expect(escrito.personas_autorizadas).toBe("(por confirmar)");
    expect(escrito.firma_representante).toMatch(/por confirmar/);
  });
});
