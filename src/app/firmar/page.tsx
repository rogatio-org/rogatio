import type { Metadata } from "next";
import { PorConstruir } from "@/components/por-construir";

export const metadata: Metadata = { title: "Firmar · Rogatio" };

export default function Firmar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Firmar la petición</h1>
      <p>
        Aquí la persona acredita su identidad con un formulario simulado de la credencial del INE
        y firma una sola vez.
      </p>
      <PorConstruir
        titulo="Formulario de firma"
        tareas={[
          "Mostrar el aviso de privacidad y pedir consentimiento expreso.",
          "Capturar CURP, clave de elector, nombre y sección (datos ficticios).",
          "Validar el formato y el dígito verificador de la CURP.",
          "Comprobar que la sección pertenece a la alcaldía Cuauhtémoc.",
          "Registrar la firma y llevar a la persona a su comprobante.",
        ]}
      />
    </div>
  );
}
