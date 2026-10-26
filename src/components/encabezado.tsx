import Link from "next/link";
import { peticionDemo } from "@/lib/peticion-demo";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: `/peticion/${peticionDemo.peticion.id}`, texto: "Petición" },
  { href: "/verificar", texto: "Verificar" },
] as const;

export function Encabezado() {
  return (
    <header className="border-b bg-card print:hidden">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-primary text-base text-primary-foreground"
          >
            R
          </span>
          Rogatio
        </Link>
        <ul className="flex gap-1 text-sm font-medium sm:gap-2">
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
              >
                {enlace.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
