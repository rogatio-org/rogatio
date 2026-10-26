"use client";

import { Button } from "@/components/ui/button";

export function BotonImprimir() {
  return (
    <Button size="lg" onClick={() => window.print()}>
      Imprimir o guardar como PDF
    </Button>
  );
}
