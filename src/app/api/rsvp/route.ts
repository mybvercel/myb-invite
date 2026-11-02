import { buscarInvitacion } from "@/invitaciones";
import { leerPanel } from "@/lib/panel-almacen";
import { demasiadoSeguido, guardar, listar, puedeVerLista, validar } from "@/lib/rsvp";

/** Escribe en disco: nunca se prerenderiza ni se cachea. */
export const dynamic = "force-dynamic";

const ipDe = (pedido: Request) =>
  pedido.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  pedido.headers.get("x-real-ip") ||
  "local";

export async function POST(pedido: Request) {
  if (demasiadoSeguido(ipDe(pedido))) {
    return Response.json({ error: "Probá de nuevo en un rato" }, { status: 429 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await pedido.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const revisado = validar(cuerpo);
  if ("error" in revisado) return Response.json(revisado, { status: 400 });

  /* Links personales y evento cerrado. El nombre y el tope de personas los
     pone el panel, no el formulario: con el link de la Familia Gómez no se
     puede confirmar por otra familia ni sumar gente de más. */
  const { datos } = revisado;
  try {
    const panel = await leerPanel(revisado.slug, buscarInvitacion(revisado.slug)!.diseno.acento);
    if (datos.familia) {
      const fila = panel.invitados.find((i) => i.enlace?.token === datos.familia);
      if (!fila?.enlace) {
        return Response.json({ error: "Este link ya no es válido. Pediles uno nuevo a los novios." }, { status: 400 });
      }
      datos.nombre = fila.nombre;
      if (datos.asiste) datos.acompanantes = Math.min(datos.acompanantes, fila.enlace.cupo);
    } else if (panel.ajustes.cerrado) {
      return Response.json({ error: "Esta invitación es personal: confirmá desde el link que te mandaron." }, { status: 403 });
    }
  } catch {
    // Sin panel no se puede validar un link personal; el general sigue andando.
    if (datos.familia) return Response.json({ error: "No pudimos guardar tu confirmación" }, { status: 500 });
  }

  try {
    await guardar(revisado.slug, revisado.datos);
  } catch {
    // El invitado no tiene por qué enterarse de un problema de disco, pero
    // tampoco le podemos decir que quedó confirmado si no se guardó.
    return Response.json({ error: "No pudimos guardar tu confirmación" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

/** La lista es para la pareja, no para los invitados: va con clave. */
export async function GET(pedido: Request) {
  const url = new URL(pedido.url);
  const slug = url.searchParams.get("slug") ?? "";

  if (!puedeVerLista(url.searchParams.get("clave") ?? undefined)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  return Response.json({ confirmaciones: await listar(slug) });
}
