// Sella en OpenTimestamps las raíces sin prueba y actualiza las pendientes.
// Corre cada hora en producción: npm run db:anclar. Ver src/lib/anclaje.ts.
import { cerrarDb } from "../src/db";
import { anclarRaices } from "../src/lib/anclaje";

try {
  process.loadEnvFile(".env.local");
} catch {}

anclarRaices()
  .then(({ revisadas, selladas, ancladas }) => {
    console.log(`Anclaje: ${revisadas} raíces revisadas, ${selladas} selladas, ${ancladas} ancladas en Bitcoin.`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(cerrarDb);
