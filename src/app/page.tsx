import { EnlaceBoton } from "@/components/enlace-boton";
import { peticionDemo } from "@/lib/peticion-demo";

export default function Inicio() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rogatio</h1>
      <p className="text-lg">
        Rogatio es una plataforma de código abierto para peticiones ciudadanas en México: cada
        firma se acredita con la credencial del INE y se registra con un comprobante verificable.
        Al alcanzar el umbral, Rogatio redacta una petición formal con base en el Art. 8 de la
        Constitución y la envía a la autoridad competente.
      </p>
      <EnlaceBoton href={`/peticion/${peticionDemo.peticion.id}`}>
        Ver la petición de ejemplo
      </EnlaceBoton>
    </div>
  );
}
