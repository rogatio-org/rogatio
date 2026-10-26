import Link from "next/link";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/verificar", texto: "Verificar" },
] as const;

export function Encabezado() {
  return (
    <header className="border-b print:hidden">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3"
      >
        <Link href="/" className="text-lg font-bold">
          Rogatio
        </Link>
        <ul className="flex gap-4 text-sm">
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <Link href={enlace.href} className="underline-offset-4 hover:underline">
                {enlace.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
