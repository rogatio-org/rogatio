import { useId } from "react";

type Props = {
  titulo: string;
  tareas: string[];
};

// Marcador para el trabajo de la mesa del evento.
export function PorConstruir({ titulo, tareas }: Props) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="text-xs font-bold tracking-wide uppercase">
        Por construir en la mesa
      </p>
      <h2 id={id} className="mt-1 text-lg font-semibold">
        {titulo}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {tareas.map((tarea) => (
          <li key={tarea}>{tarea}</li>
        ))}
      </ul>
    </section>
  );
}
