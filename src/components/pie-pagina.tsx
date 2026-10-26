export function PiePagina() {
  return (
    <footer className="border-t bg-card print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>Rogatio · código abierto (AGPL-3.0)</p>
        <p>Demo con datos ficticios. Ninguna petición se envía.</p>
      </div>
    </footer>
  );
}
