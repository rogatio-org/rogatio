import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as esquema from "./esquema";

export { esquema };
export type BaseDeDatos = NodePgDatabase<typeof esquema>;

let pool: Pool | undefined;
let db: BaseDeDatos | undefined;

// Perezoso: importar este módulo sin DATABASE_URL no rompe el build.
export function obtenerDb(): BaseDeDatos {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  pool = new Pool({ connectionString: url });
  db = drizzle({ client: pool, schema: esquema });
  return db;
}

export async function cerrarDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
  db = undefined;
}
