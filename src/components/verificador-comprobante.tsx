"use client";

import Link from "next/link";
import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ResultadoOts } from "@/lib/opentimestamps";
import { verificarTexto, type ResultadoVerificacion } from "@/lib/verificacion";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Todo ocurre en el navegador: lee el archivo o el texto y recalcula la raíz con Web Crypto.
export function VerificadorComprobante() {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [raizPublicada, setRaizPublicada] = useState("");
  const [ots, setOts] = useState<Uint8Array | undefined>();
  const [resultado, setResultado] = useState<ResultadoVerificacion | null>(null);
  const [verificando, setVerificando] = useState(false);

  async function cargarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    setResultado(null);
    try {
      setTexto(archivo ? await archivo.text() : "");
    } catch {
      setTexto("");
      setResultado({ estado: "error", error: "no_es_json" });
    }
  }

  async function cargarOts(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    setResultado(null);
    try {
      setOts(archivo ? new Uint8Array(await archivo.arrayBuffer()) : undefined);
    } catch {
      setOts(undefined);
    }
  }

  async function verificar(evento: FormEvent) {
    evento.preventDefault();
    setVerificando(true);
    try {
      setResultado(await verificarTexto(texto, raizPublicada, ots));
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={verificar} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={`${id}-archivo`} className="block font-semibold">
            Sube tu comprobante (.json)
          </label>
          <input
            id={`${id}-archivo`}
            type="file"
            accept="application/json,.json"
            onChange={cargarArchivo}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-muted file:px-3 file:py-1.5"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-texto`} className="block font-semibold">
            O pega su contenido
          </label>
          <textarea
            id={`${id}-texto`}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setResultado(null);
            }}
            rows={8}
            spellCheck={false}
            className={campo}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-raiz`} className="block font-semibold">
            Raíz publicada en la petición (opcional)
          </label>
          <input
            id={`${id}-raiz`}
            value={raizPublicada}
            onChange={(e) => {
              setRaizPublicada(e.target.value);
              setResultado(null);
            }}
            spellCheck={false}
            autoComplete="off"
            className={campo}
          />
          <p className="text-sm text-muted-foreground">
            Cópiala de la página de la petición cuando tenga las mismas firmas en el árbol que tu
            comprobante.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-ots`} className="block font-semibold">
            Prueba de OpenTimestamps (.ots, opcional)
          </label>
          <input
            id={`${id}-ots`}
            type="file"
            accept=".ots"
            onChange={cargarOts}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-muted file:px-3 file:py-1.5"
          />
          <p className="text-sm text-muted-foreground">
            Descárgala de la página de tu comprobante. Prueba que la raíz existía en la fecha de un
            bloque de Bitcoin.
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!texto.trim() || verificando}
          className="w-full sm:w-auto"
        >
          Verificar
        </Button>
      </form>

      {resultado && <Resultado resultado={resultado} />}
      {resultado && resultado.estado !== "error" && resultado.anclaje && (
        <Anclaje anclaje={resultado.anclaje} />
      )}

      <p className="text-sm text-muted-foreground">
        La verificación ocurre en tu navegador. No se envía nada a Rogatio. Para revisar el .ots,
        tu navegador consulta el bloque en blockstream.info.
      </p>
    </div>
  );
}

function Resultado({ resultado }: { resultado: ResultadoVerificacion }) {
  if (resultado.estado === "error") {
    return (
      <Aviso tono="error" titulo="No pudimos leer el archivo">
        {resultado.error === "no_es_json"
          ? "El archivo no es un comprobante de Rogatio. Descárgalo otra vez desde la página de tu comprobante."
          : "Al archivo le faltan datos del comprobante. Descárgalo otra vez desde la página de tu comprobante."}
      </Aviso>
    );
  }

  const { comprobante, inclusionValida, coincideRaizPublicada } = resultado;
  const enlacePeticion = (
    <Link href={`/peticion/${encodeURIComponent(comprobante.peticion)}`} className="underline">
      la página de la petición
    </Link>
  );

  if (resultado.estado === "valido") {
    return (
      <Aviso tono="valido" titulo="Válido">
        La firma número {comprobante.secuencia} está en el registro de {comprobante.tamano} firmas
        de la raíz <code className="font-mono">{comprobante.raiz.slice(0, 8)}…</code>.{" "}
        {coincideRaizPublicada
          ? "Esa raíz coincide con la que pegaste."
          : <>Compara esa raíz con la publicada en {enlacePeticion}.</>}
      </Aviso>
    );
  }

  return (
    <Aviso tono="no_valido" titulo="No válido">
      {inclusionValida
        ? "La raíz del comprobante no coincide con la raíz publicada que pegaste. Revisa que ambas sean del mismo número de firmas."
        : "Los datos del comprobante no llevan a su raíz: el comprobante fue alterado o está dañado. Descárgalo otra vez desde la página de tu comprobante."}
    </Aviso>
  );
}

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

function Anclaje({ anclaje }: { anclaje: ResultadoOts }) {
  switch (anclaje.estado) {
    case "anclada":
      return (
        <Aviso tono="valido" titulo="Anclada en Bitcoin">
          La raíz del comprobante está en el bloque {anclaje.altura} de Bitcoin, del{" "}
          {formatoFecha.format(anclaje.fecha)}. Nadie pudo crearla ni cambiarla después de esa
          fecha.
        </Aviso>
      );
    case "pendiente":
      return (
        <Aviso tono="error" titulo="Anclaje pendiente">
          La prueba aún no llega a Bitcoin. Tarda unas horas. Descarga otra vez el .ots desde la
          página de tu comprobante más tarde.
        </Aviso>
      );
    case "sin_consulta":
      return (
        <Aviso tono="error" titulo="No pudimos consultar el bloque">
          Compara a mano la raíz de Merkle del bloque {anclaje.altura} con{" "}
          <code className="font-mono break-all">{anclaje.raizMerkle}</code>.
        </Aviso>
      );
    case "no_coincide":
      return (
        <Aviso tono="no_valido" titulo="El .ots es de otra raíz">
          La prueba de OpenTimestamps no corresponde a la raíz de este comprobante. Descarga el .ots
          desde la página de tu comprobante.
        </Aviso>
      );
    case "no_valido":
      return (
        <Aviso tono="no_valido" titulo="Prueba .ots no válida">
          {anclaje.motivo}. Descarga el .ots otra vez desde la página de tu comprobante.
        </Aviso>
      );
  }
}

const tonos = {
  valido: "border-green-600 bg-green-50 text-green-950 dark:bg-green-950/30 dark:text-green-100",
  no_valido: "border-red-600 bg-red-50 text-red-950 dark:bg-red-950/30 dark:text-red-100",
  error: "border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
} as const;

function Aviso({
  tono,
  titulo,
  children,
}: {
  tono: keyof typeof tonos;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section role="status" className={cn("rounded-lg border-2 p-4", tonos[tono])}>
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="mt-1 text-sm">{children}</p>
    </section>
  );
}
