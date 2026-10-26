import { FileText } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { EnlaceBoton } from "@/components/enlace-boton";
import type { buttonVariants } from "@/components/ui/button";
import { escritoDisponible } from "@/lib/escrito-art8";
import type { PeticionDemo } from "@/lib/peticion-demo";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  conteo: PeticionDemo["conteo"];
  className?: string;
} & Pick<VariantProps<typeof buttonVariants>, "variant">;

// Solo aparece cuando la petición llega a su umbral.
export function EnlaceEscrito({ id, conteo, variant = "outline", className }: Props) {
  if (!escritoDisponible(conteo)) return null;
  return (
    <EnlaceBoton
      href={`/peticion/${id}/escrito`}
      variant={variant}
      className={cn("w-full", className)}
    >
      <FileText aria-hidden />
      Ver escrito del Art. 8
    </EnlaceBoton>
  );
}
