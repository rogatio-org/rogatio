"use client";

import Image from "next/image";
import { useActionState, useId, useState, type ReactNode } from "react";
import { firmar } from "@/app/firmar/acciones";
import { EnlaceBoton } from "@/components/enlace-boton";
import { Button } from "@/components/ui/button";
import { validarDatosFirma, type CampoFirma, type EstadoFirma } from "@/lib/datos-firma";
import muestras from "../../data/fixtures/credenciales-muestra.json";

type Paso = "aviso" | "credencial" | "confirmar";
type Campos = Record<CampoFirma, string>;

const PASOS: Paso[] = ["aviso", "credencial", "confirmar"];
const VACIOS: Campos = { nombre: "", curp: "", claveElector: "", seccion: "" };
const ESTADO_INICIAL: EstadoFirma = { tipo: "inicial" };

const ETIQUETAS: Record<CampoFirma, string> = {
  nombre: "Nombre completo",
  curp: "CURP",
  claveElector: "Clave de elector",
  seccion: "Sección",
};

type Props = { slug: string; titulo: string };

// Los datos viven solo en el estado del componente: nada en localStorage ni en la URL.
export function FormularioFirma({ slug, titulo }: Props) {
  const [estado, accion, pendiente] = useActionState(firmar.bind(null, slug), ESTADO_INICIAL);
  const [paso, setPaso] = useState<Paso>("aviso");
  const [consentimiento, setConsentimiento] = useState(false);
  const [muestraId, setMuestraId] = useState(muestras.credenciales[0].id);
  const [campos, setCampos] = useState<Campos>(VACIOS);
  const [erroresLocales, setErroresLocales] = useState<Partial<Campos>>({});
  // Resultado de la acción que la persona ya dejó atrás.
  const [descartado, setDescartado] = useState<EstadoFirma>(ESTADO_INICIAL);

  const resultado = estado === descartado ? null : estado;
  const errores = resultado?.tipo === "invalido" ? resultado.errores : erroresLocales;
  const pasoVisible = resultado?.tipo === "invalido" ? "credencial" : paso;

  function irA(siguiente: Paso) {
    setDescartado(estado);
    setPaso(siguiente);
    window.scrollTo({ top: 0 });
  }

  function reiniciar() {
    setCampos(VACIOS);
    setErroresLocales({});
    irA("credencial");
  }

  // Al descartar un rechazo del servidor, sus errores pasan al estado local.
  function descartarResultado() {
    if (resultado?.tipo === "invalido") {
      setPaso("credencial");
      setErroresLocales(resultado.errores);
    }
    setDescartado(estado);
  }

  function cambiar(campo: CampoFirma, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    descartarResultado();
    setErroresLocales((e) => ({ ...e, [campo]: undefined }));
  }

  function leerCredencial() {
    const muestra = muestras.credenciales.find((m) => m.id === muestraId);
    if (!muestra) return;
    setCampos({
      nombre: muestra.nombre,
      curp: muestra.curp,
      claveElector: muestra.claveElector,
      seccion: String(muestra.seccion),
    });
    descartarResultado();
    setErroresLocales({});
  }

  function continuarConDatos() {
    const validacion = validarDatosFirma(campos);
    if (!validacion.ok) {
      setErroresLocales(validacion.errores);
      return;
    }
    irA("confirmar");
  }

  if (resultado && resultado.tipo !== "invalido" && resultado.tipo !== "inicial") {
    return (
      <PantallaResultado
        resultado={resultado}
        slug={slug}
        alReintentar={() => irA("confirmar")}
        alCambiarCredencial={reiniciar}
        alVolverAlAviso={() => irA("aviso")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Paso {PASOS.indexOf(pasoVisible) + 1} de {PASOS.length} · {titulo}
      </p>

      {pasoVisible === "aviso" && (
        <section className="space-y-4" aria-labelledby="titulo-aviso">
          <h2 id="titulo-aviso" className="text-xl font-semibold">
            Aviso de privacidad
          </h2>
          <AvisoPrivacidad />
          <label className="flex items-start gap-3 rounded-lg border p-4">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
            />
            <span>
              Leí el aviso y doy mi consentimiento expreso para que Rogatio trate mis datos,
              incluido el dato sensible de que apoyo esta petición, para las finalidades del aviso.
            </span>
          </label>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!consentimiento}
            onClick={() => irA("credencial")}
          >
            Acepto y continúo
          </Button>
        </section>
      )}

      {pasoVisible === "credencial" && (
        <section className="space-y-5" aria-labelledby="titulo-credencial">
          <h2 id="titulo-credencial" className="text-xl font-semibold">
            Tu credencial para votar
          </h2>
          <p>
            En la demo no se usa ninguna credencial real. Elige una credencial de muestra con datos
            ficticios.
          </p>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Credencial de muestra</legend>
            {muestras.credenciales.map((m) => (
              <label
                key={m.id}
                className="cursor-pointer space-y-2 rounded-lg border p-3 has-checked:border-primary has-checked:ring-2 has-checked:ring-primary/30"
              >
                <Image
                  src={m.imagen}
                  alt={`${m.etiqueta}: credencial ficticia marcada como MUESTRA`}
                  width={856}
                  height={540}
                  unoptimized
                  className="h-auto w-full rounded-md"
                />
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="muestra"
                    value={m.id}
                    checked={muestraId === m.id}
                    onChange={() => setMuestraId(m.id)}
                  />
                  {m.etiqueta}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="secondary" size="lg" onClick={leerCredencial}>
              Leer credencial (simulado)
            </Button>
            <p className="text-sm text-muted-foreground">
              Lectura simulada: no hay OCR en la demo.
            </p>
          </div>

          <div className="grid gap-4">
            {(Object.keys(ETIQUETAS) as CampoFirma[]).map((campo) => (
              <Campo
                key={campo}
                etiqueta={ETIQUETAS[campo]}
                valor={campos[campo]}
                error={errores[campo]}
                alCambiar={(v) => cambiar(campo, v)}
                numerico={campo === "seccion"}
                maximo={campo === "seccion" ? 4 : campo === "nombre" ? 120 : 18}
              />
            ))}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" size="lg" onClick={() => irA("aviso")}>
              Atrás
            </Button>
            <Button size="lg" onClick={continuarConDatos}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {pasoVisible === "confirmar" && (
        <form action={accion} className="space-y-5" aria-labelledby="titulo-confirmar">
          <h2 id="titulo-confirmar" className="text-xl font-semibold">
            Confirma y firma
          </h2>
          <p>
            Revisa tus datos. Al firmar, tu apoyo queda en el registro público con un seudónimo.
          </p>
          <dl className="grid gap-3 rounded-lg border p-4 text-sm">
            {(Object.keys(ETIQUETAS) as CampoFirma[]).map((campo) => (
              <div key={campo}>
                <dt className="font-semibold">{ETIQUETAS[campo]}</dt>
                <dd className="font-mono break-all">{campos[campo].toUpperCase()}</dd>
                <input type="hidden" name={campo} value={campos[campo]} />
              </div>
            ))}
          </dl>
          <input type="hidden" name="consentimiento" value={consentimiento ? "si" : ""} />
          <p className="text-sm text-muted-foreground">
            Firmas una sola vez. Tu nombre y tu CURP se guardan cifrados y no se publican.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={pendiente}
              onClick={() => irA("credencial")}
            >
              Corregir datos
            </Button>
            <Button type="submit" size="lg" disabled={pendiente}>
              {pendiente ? "Firmando…" : "Firmar la petición"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  error,
  alCambiar,
  numerico,
  maximo,
}: {
  etiqueta: string;
  valor: string;
  error?: string;
  alCambiar: (valor: string) => void;
  numerico: boolean;
  maximo: number;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        maxLength={maximo}
        inputMode={numerico ? "numeric" : "text"}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function AvisoPrivacidad() {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
      <p className="font-semibold">Texto provisional para la demo: pendiente de revisión legal.</p>
      <p>
        <strong>Quién es responsable.</strong> Rogatio, proyecto de código abierto, trata tus datos
        para esta petición.
      </p>
      <p>
        <strong>Qué datos pedimos.</strong> Nombre, CURP, clave de elector y sección electoral de tu
        credencial para votar. Firmar una petición puede mostrar una opinión política: es un dato
        sensible y por eso pedimos tu consentimiento expreso.
      </p>
      <p>
        <strong>Para qué.</strong> Revisar que vives donde aplica la petición, evitar firmas dobles
        y preparar el escrito del Art. 8 de la Constitución que recibe la autoridad.
      </p>
      <p>
        <strong>Cómo los guardamos.</strong> Tu nombre y tu CURP se guardan cifrados. En claro solo
        quedan un seudónimo de tu CURP y tu sección. La clave de elector no se guarda. No escribimos
        tus datos en bitácoras.
      </p>
      <p>
        <strong>Tus derechos.</strong> Puedes pedir acceso, corrección, cancelación u oposición
        (derechos ARCO) y retirar tu consentimiento. Contacto: por definir en la versión real.
      </p>
      <p>En esta demo solo se usan credenciales de muestra con datos ficticios.</p>
    </div>
  );
}

function PantallaResultado({
  resultado,
  slug,
  alReintentar,
  alCambiarCredencial,
  alVolverAlAviso,
}: {
  resultado: Exclude<EstadoFirma, { tipo: "inicial" | "invalido" }>;
  slug: string;
  alReintentar: () => void;
  alCambiarCredencial: () => void;
  alVolverAlAviso: () => void;
}) {
  const verPeticion = (
    <EnlaceBoton href={`/peticion/${slug}`} variant="outline">
      Ver la petición
    </EnlaceBoton>
  );

  switch (resultado.tipo) {
    case "fuera_de_jurisdiccion":
      return (
        <Resultado titulo={`Tu sección no pertenece a ${resultado.jurisdiccion}`}>
          <p>
            {resultado.alcaldiaSeccion
              ? `Tu credencial dice sección ${resultado.seccion}, que es de la alcaldía ${resultado.alcaldiaSeccion}.`
              : `Tu credencial dice sección ${resultado.seccion}, y no la encontramos entre las secciones de la Ciudad de México que usa la demo.`}{" "}
            Esta petición es para quienes viven en {nombreLugar(resultado.jurisdiccion)}, porque se
            dirige a su autoridad.
          </p>
          <p>No guardamos ninguno de tus datos. Puedes compartir la petición con quien viva ahí.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {verPeticion}
            <Button variant="outline" size="lg" onClick={alCambiarCredencial}>
              Probar con otra credencial
            </Button>
            <EnlaceBoton href="/" variant="ghost">
              Volver al inicio
            </EnlaceBoton>
          </div>
        </Resultado>
      );
    case "ya_firmo":
      return (
        <Resultado titulo="Ya firmaste esta petición">
          <p>Cada persona firma una sola vez. Tu firma ya está en el registro.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <EnlaceBoton href={`/comprobante/${resultado.idComprobante}`}>
              Ver mi comprobante
            </EnlaceBoton>
            {verPeticion}
          </div>
        </Resultado>
      );
    case "sin_consentimiento":
      return (
        <Resultado titulo="Falta tu consentimiento">
          <p>Sin tu consentimiento expreso no podemos registrar tu firma. No guardamos tus datos.</p>
          <Button size="lg" className="w-full sm:w-auto" onClick={alVolverAlAviso}>
            Leer el aviso de privacidad
          </Button>
        </Resultado>
      );
    case "peticion_cerrada":
      return (
        <Resultado titulo="Esta petición ya no recibe firmas">
          <p>La petición está cerrada. No registramos tu firma ni guardamos tus datos.</p>
          {verPeticion}
        </Resultado>
      );
    case "peticion_inexistente":
      return (
        <Resultado titulo="No encontramos la petición">
          <p>No registramos tu firma ni guardamos tus datos.</p>
          <EnlaceBoton href="/">Volver al inicio</EnlaceBoton>
        </Resultado>
      );
    case "error":
      return (
        <Resultado titulo="No pudimos registrar tu firma">
          <p>Hubo un problema de nuestro lado. Intenta de nuevo en un momento.</p>
          <Button size="lg" className="w-full sm:w-auto" onClick={alReintentar}>
            Intentar de nuevo
          </Button>
        </Resultado>
      );
    case "firmada":
      // La acción redirige al comprobante; esto solo se ve si la redirección falla.
      return (
        <Resultado titulo="Tu firma quedó registrada">
          <EnlaceBoton href={`/comprobante/${resultado.idComprobante}`}>
            Ver mi comprobante
          </EnlaceBoton>
        </Resultado>
      );
  }
}

function nombreLugar(jurisdiccion: string) {
  return jurisdiccion.startsWith("Distrito")
    ? `el ${jurisdiccion.toLowerCase()}`
    : `la alcaldía ${jurisdiccion}`;
}

function Resultado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section role="status" className="space-y-4" aria-live="polite">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}
