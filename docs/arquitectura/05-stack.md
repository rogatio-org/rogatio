# Stack

Estado: decisión. Fecha: 2026-10-23.

## Decisión

| Pieza | Elección |
|---|---|
| Lenguaje y framework | TypeScript y Next.js |
| UI | Tailwind CSS y shadcn/ui |
| Base de datos | Postgres en Neon, sin PostGIS |
| ORM | Drizzle |
| Hosting | Vercel, con una vista previa por PR |
| CI | GitHub Actions: lint, tipos y pruebas |
| Desarrollo | GitHub Codespaces |

## Por qué

- Solo entre el 20% y el 30% de la mesa programa. Nadie debe instalar nada.
- v0 genera Next.js. Lo que diseñe UX entra al repo sin traducción.
- Un solo lenguaje reduce las fallas. Python queda para el OCR, después de la demo.
- Codespaces corre en el navegador. No usa la memoria de la laptop ni el Wi-Fi del evento para descargas grandes.

## Reglas

- La demo usa solo datos ficticios.
- Cada PR tiene su propia rama de base en Neon.
- Los secretos viven solo en las variables de Production de Vercel.
- Quien programa trabaja en una rama del repo, no en un fork.
- `main` acepta cambios solo por PR, con aprobación del code owner.

## Cambios en otros documentos

- El esquema inicial no incluye las columnas `geometria` de [01-jurisdicciones.md](01-jurisdicciones.md). Responde 01-jurisdicciones.md:169.
- `enrutar()` de [02-enrutamiento.md](02-enrutamiento.md), secc. 6.3, pasa a TypeScript.

## Por verificar

- Si las cuentas externas pueden comentar las vistas previas en el plan Hobby.
- Los créditos gratis de v0 y si v0 abre PR en un repo de una organización.
- El plan de Vercel del piloto. Hobby es de uso no comercial.
