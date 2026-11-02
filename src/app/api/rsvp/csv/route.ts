import { listar, puedeVerLista } from "@/lib/rsvp";

export const dynamic = "force-dynamic";

/** Comillas dobles y separador punto y coma: es lo que abre bien el Excel en
    español sin pedir nada al usuario. */
const celda = (v: string | number | boolean) => `"${String(v).replace(/"/g, '""')}"`;

export async function GET(pedido: Request) {
  const url = new URL(pedido.url);
  const slug = url.searchParams.get("slug") ?? "";

  if (!puedeVerLista(url.searchParams.get("clave") ?? undefined)) {
    return new Response("No autorizado", { status: 401 });
  }

  const lista = await listar(slug);
  const filas = [
    ["Nombre", "Viene", "Personas", "Restricciones", "Canción", "Fecha"].map(celda).join(";"),
    ...lista.map((c) =>
      [
        celda(c.nombre),
        celda(c.asiste ? "Sí" : "No"),
        celda(c.acompanantes),
        celda(c.comidas.join(", ")),
        celda(c.cancion),
        celda(new Date(c.enviada).toLocaleString("es-AR")),
      ].join(";"),
    ),
  ].join("\n");

  // El BOM es lo que hace que Excel no rompa los acentos.
  return new Response("﻿" + filas, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="confirmaciones-${slug}.csv"`,
    },
  });
}
