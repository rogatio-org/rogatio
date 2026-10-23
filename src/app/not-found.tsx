import { EnlaceBoton } from "@/components/enlace-boton";

export default function NoEncontrado() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p>La dirección no existe o la petición no está disponible.</p>
      <EnlaceBoton href="/" variant="outline">
        Volver al inicio
      </EnlaceBoton>
    </div>
  );
}
