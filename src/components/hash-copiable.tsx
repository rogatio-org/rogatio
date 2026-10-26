"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Muestra los primeros caracteres de un hash y permite copiarlo completo.
export function HashCopiable({ hash, etiqueta }: { hash: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" title={hash}>
        {hash.slice(0, 8)}…
      </code>
      <Button variant="outline" size="xs" onClick={copiar} aria-label={`Copiar ${etiqueta}`}>
        {copiado ? "Copiado" : "Copiar"}
      </Button>
    </span>
  );
}
