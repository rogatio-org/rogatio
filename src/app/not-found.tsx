import { EnlaceBoton } from "@/components/enlace-boton";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">No encontramos esta página</h1>
      <p>La dirección no existe o la petición no está disponible.</p>
      <EnlaceBoton href="/" variant="outline">
        Volver al inicio
      </EnlaceBoton>
    </div>
  );
}
