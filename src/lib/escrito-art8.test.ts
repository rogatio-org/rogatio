import { describe, expect, it } from "vitest";
import {
  CAMPOS,
  MARCA_SIMULACION,
  PLANTILLA_ESCRITO,
  camposDesdePeticion,
  copiasDelEscrito,
  escritoDisponible,
  firmantesFicticios,
  formatearFecha,
  periodoDeFirmas,
  fundamentoDe,
  llenarEscrito,
  puntosPetitorios,
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
    distritos,
    fecha: new Date("2026-10-26T18:00:00Z"),
    urlVerificacion: "https://rogatio.example.org/verificar",
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
    expect(texto).toContain("Persona Ficticia Uno, por mi propio derecho");
    expect(texto).toContain("representante común de las 50 personas firmantes");
    expect(texto).toContain("notificaciones@example.org");
    expect(texto).toContain("Persona titular de la Alcaldía Cuauhtémoc");
    expect(texto).toContain("art. 32 fr. IV");
    expect(texto).toContain("entre el 24 de octubre de 2026 y el 26 de octubre de 2026");
    expect(texto).toContain("Ciudad de México, a 26 de octubre de 2026.");
    expect(texto).toContain("https://rogatio.example.org/verificar");
    expect(texto).toContain(peticionDemo.raiz.hash);
    expect(texto).toContain("(24 de 50 personas firmantes)");
    expect(secciones.map((s) => s.id)).toEqual(PLANTILLA_ESCRITO.map((s) => s.id));
  });

  it("el anexo tiene 50 nombres ficticios con su comprobante", () => {
    const { secciones, firmantes } = llenarEscrito(
      camposDemo(),
      firmantesFicticios("peticion-demo", 50),
    );
    const anexo = secciones.find((s) => s.id === "anexo")!.texto.split("\n");
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

  it("numera los puntos petitorios y agrega la respuesta por escrito", () => {
    expect(puntosPetitorios(["Reparar.", "Publicar."]).split("\n")).toEqual([
      "PRIMERO. Reparar.",
      "SEGUNDO. Publicar.",
      "TERCERO. Que se dé respuesta por escrito, en breve término, en el domicilio y el correo señalados.",
    ]);
  });

  it("solo da fundamento para categorías verificadas", () => {
    expect(fundamentoDe("alumbrado")).toContain("art. 32 fr. IV");
    expect(fundamentoDe("baches")).toContain("arts. 32 fr. IV y 33");
    expect(fundamentoDe("metro")).toBeNull();
  });

  it("copia al Concejo y a cada distrito local", () => {
    expect(copiasDelEscrito("Cuauhtémoc", distritos, 50)).toBe(
      "Concejo de la Alcaldía Cuauhtémoc; " +
        "Diputación del Distrito local 9 de la Ciudad de México, Congreso de la Ciudad de México (24 de 50 personas firmantes); " +
        "Diputación del Distrito local 12 de la Ciudad de México, Congreso de la Ciudad de México (26 de 50 personas firmantes)",
    );
  });

  it("describe el periodo de firmas", () => {
    expect(periodoDeFirmas("2026-10-26T15:00:00Z", "2026-10-26T20:00:00Z")).toBe(
      "el 26 de octubre de 2026",
    );
  });

  it("formatea la fecha en la hora de la Ciudad de México", () => {
    expect(formatearFecha("2026-10-27T05:00:00Z")).toBe("26 de octubre de 2026");
  });

  it("solo está disponible al llegar al umbral", () => {
    expect(escritoDisponible({ firmas: 49, umbral: 50 })).toBe(false);
    expect(escritoDisponible({ firmas: 50, umbral: 50 })).toBe(true);
  });

  it("la marca de simulación es exacta", () => {
    expect(MARCA_SIMULACION).toBe("SIMULACIÓN – NO ENVIADO");
  });

  it("el fixture del escrito solo usa datos ficticios", () => {
    expect(escrito.representante_comun).toMatch(/ficticia/i);
    expect(escrito.correo_notificaciones).toMatch(/@example\.org$/);
    expect(escrito.domicilio_notificaciones).toContain("Ejemplo Centro");
  });
});
