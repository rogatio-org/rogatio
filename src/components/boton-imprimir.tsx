"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonImprimir() {
  return (
    <Button size="lg" className="h-10 px-4" onClick={() => window.print()}>
      <Printer aria-hidden />
      Imprimir o guardar como PDF
    </Button>
  );
}
