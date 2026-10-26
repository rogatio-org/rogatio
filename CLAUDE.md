# CLAUDE.md

Instrucciones para agentes de código (Claude Code y otros) que trabajan en este repositorio.

@AGENTS.md

## Proyecto

Rogatio: peticiones ciudadanas verificadas para México. Contexto de producto y arquitectura en [README.md](README.md) y [docs/README.md](docs/README.md).

## Stack

- Next.js 16 (App Router) con React 19 y TypeScript. Lee la guía en `node_modules/next/dist/docs/` antes de escribir código de Next.
- Tailwind CSS 4 y componentes shadcn (`src/components/ui`).
- Drizzle ORM sobre Postgres (`src/db`, migraciones en `drizzle/`).
- Node 24 (ver `.nvmrc`).

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run lint         # ESLint
npm run typecheck    # next typegen + tsc
npm run test         # Vitest
npm run build        # build de producción (no debe conectarse a Postgres)
npm run db:generate  # genera migraciones con drizzle-kit
npm run db:migrate   # aplica migraciones
npm run db:seed      # carga datos de la demo
npm run db:anclar    # sella raíces en OpenTimestamps y actualiza las pendientes
```

CI (`.github/workflows/ci.yml`) corre lint, typecheck, test y build en cada PR.

## Estructura

- `src/app/`: rutas (`peticion`, `firmar`, `comprobante`, `verificar`).
- `src/components/`: componentes de la app; `ui/` es shadcn.
- `src/db/`: esquema, cliente, cifrado y seudónimos.
- `src/lib/`: utilidades y datos de la demo.
- `scripts/`: scripts de mantenimiento (semilla).
- `docs/`: whitepaper, transparencia y notas de arquitectura.

## Convenciones

- El código, los nombres y la documentación están en español.
- Nunca subas secretos: usa `.env.local` a partir de `.env.example`.
- Commits estilo Conventional Commits (`feat:`, `fix:`, `docs:`...).

## Pendiente

<!-- Completa: reglas de privacidad (CURP, INE), flujo de PRs, cómo probar con la base de datos, etc. -->
