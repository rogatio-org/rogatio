"use server";

import { redirect } from "next/navigation";
import { validarDatosFirma, type EstadoFirma } from "@/lib/datos-firma";
import { firmarPeticion } from "@/lib/firma";

/** Server Action del formulario de firma. Si la firma queda registrada, lleva al comprobante. */
export async function firmar(
  slug: string,
  _previo: EstadoFirma,
  formData: FormData,
): Promise<EstadoFirma> {
  const validacion = validarDatosFirma({
    nombre: formData.get("nombre"),
    curp: formData.get("curp"),
    claveElector: formData.get("claveElector"),
    seccion: formData.get("seccion"),
  });
  if (!validacion.ok) return { tipo: "invalido", errores: validacion.errores };

  let resultado: Awaited<ReturnType<typeof firmarPeticion>>;
  try {
    resultado = await firmarPeticion(slug, validacion.datos);
  } catch (error) {
    // Solo un mensaje genérico: nunca los valores enviados ni el error completo (#55).
    const codigo = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    console.error(`firmar: no se pudo registrar la firma${codigo ? ` (código ${codigo})` : ""}`);
    return { tipo: "error" };
  }

  if (resultado.tipo === "firmada") redirect(`/comprobante/${resultado.idComprobante}`);
  return resultado;
}
