import { buscarInvitacion } from "@/invitaciones";
import { leerPanel } from "@/lib/panel-almacen";

export const dynamic = "force-dynamic";

/**
 * Si el evento es cerrado. Lo pregunta el formulario de la invitación general
 * (que es estática) para no mostrar un sello que después rechaza la respuesta.
 * No expone nada más del panel.
 */
export async function GET(pedido: Request) {
  const slug = new URL(pedido.url).searchParams.get("slug") ?? "";
  const invitacion = buscarInvitacion(slug);
  if (!invitacion) return Response.json({ cerrado: false });
  try {
    const panel = await leerPanel(slug, invitacion.diseno.acento);
    return Response.json({ cerrado: panel.ajustes.cerrado });
  } catch {
    return Response.json({ cerrado: false });
  }
}
