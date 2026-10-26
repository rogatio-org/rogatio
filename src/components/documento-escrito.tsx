import { MARCA_SIMULACION, type EscritoLleno } from "@/lib/escrito-art8";

// Hoja carta.
const estiloPagina = "@page { size: letter; margin: 1.5cm 2cm; }";

/** Escrito del Art. 8 con formato de documento. */
export function DocumentoEscrito({ escrito }: { escrito: EscritoLleno }) {
  const { secciones, firmantes } = escrito;
  const seccion = (id: string) => secciones.find((s) => s.id === id);
  const cuerpo = secciones.filter((s) => s.id !== "anexo");
  const anexo = seccion("anexo");

  return (
    <>
      <style>{estiloPagina}</style>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="p-0">
              <article className="space-y-5 rounded-lg border bg-white p-6 font-serif text-[15px] leading-relaxed text-neutral-950 sm:p-10 print:rounded-none print:border-0 print:p-0">
                <p className="border-2 border-red-700 py-1 text-center text-sm font-bold tracking-wide text-red-700">
                  {MARCA_SIMULACION}
                </p>
                {cuerpo.map(({ id, titulo, texto }) => (
                  <section
                    key={id}
                    className={
                      id === "destinatario"
                        ? "font-bold whitespace-pre-line"
                        : id === "lugar_fecha"
                          ? "text-right"
                          : id === "firma"
                            ? "pt-10 text-center whitespace-pre-line break-inside-avoid"
                            : id === "copias"
                              ? "text-sm"
                              : "wrap-anywhere whitespace-pre-line"
                    }
                  >
                    {titulo && <h2 className="mb-2 text-center font-bold">{titulo}</h2>}
                    {texto}
                  </section>
                ))}
              </article>

              {anexo && (
                <section className="mt-8 rounded-lg border bg-white p-6 font-serif text-sm text-neutral-950 sm:p-10 print:mt-0 print:break-before-page print:rounded-none print:border-0 print:p-0">
                  <h2 className="mb-3 text-center font-bold">{anexo.titulo}</h2>
                  <p className="mb-3 text-justify">
                    Personas firmantes con su comprobante de firma. Cada comprobante se verifica en
                    la página de verificación de Rogatio.
                  </p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-1 pr-2">Núm.</th>
                        <th className="py-1 pr-2">Nombre</th>
                        <th className="py-1">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {firmantes.map((f) => (
                        <tr key={f.numero} className="border-b border-neutral-200">
                          <td className="py-0.5 pr-2">{f.numero}</td>
                          <td className="py-0.5 pr-2">{f.nombre}</td>
                          <td className="py-0.5 font-mono text-xs">{f.comprobante}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
