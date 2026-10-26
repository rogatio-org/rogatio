import { EnlaceBoton } from "@/components/enlace-boton";
import { escritoDisponible } from "@/lib/escrito-art8";
import type { PeticionDemo } from "@/lib/peticion-demo";

type Props = { id: string; conteo: PeticionDemo["conteo"] };

// Solo aparece cuando la petición llega a su umbral.
export function EnlaceEscrito({ id, conteo }: Props) {
  if (!escritoDisponible(conteo)) return null;
  return (
    <EnlaceBoton href={`/peticion/${id}/escrito`} variant="outline" className="w-full sm:w-auto">
      Ver escrito del Art. 8
    </EnlaceBoton>
  );
}
