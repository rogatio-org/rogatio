import { connection } from "next/server";
import { obtenerOts } from "@/lib/anclaje";

// Prueba de OpenTimestamps de la raíz de `tamano` firmas. Se sella o actualiza al pedirla.
export async function GET(_req: Request, ctx: RouteContext<"/peticion/[id]/ots/[tamano]">) {
  await connection();
  const { id, tamano } = await ctx.params;
  if (!/^[1-9]\d{0,8}$/.test(tamano)) return new Response("No encontrado", { status: 404 });

  const resultado = await obtenerOts(id, Number(tamano));
  if (!resultado) return new Response("No encontrado", { status: 404 });
  if (!resultado.ots) {
    return new Response("Los calendarios de OpenTimestamps no respondieron. Intenta más tarde.", {
      status: 503,
      headers: { "Retry-After": "60" },
    });
  }

  return new Response(Buffer.from(resultado.ots), {
    headers: {
      "Content-Type": "application/vnd.opentimestamps.v1",
      "Content-Disposition": `attachment; filename="${id.replace(/[^a-z0-9-]/gi, "")}-${tamano}.ots"`,
      // Una prueba pendiente cambia cuando se ancla en Bitcoin.
      "Cache-Control": resultado.bloqueBitcoin === null ? "no-store" : "public, max-age=86400",
    },
  });
}
