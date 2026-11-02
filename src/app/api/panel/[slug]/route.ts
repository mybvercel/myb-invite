import { buscarInvitacion } from "@/invitaciones";
import { acceso } from "@/lib/panel-acceso";
import { guardarPanel, leerPanel, VersionVieja } from "@/lib/panel-almacen";
import { listar } from "@/lib/rsvp";
import { mezclarConfirmaciones, sanearDoc } from "@/panel/logica";
import type { DocPanel } from "@/panel/tipos";

/** Datos de invitados en vivo: nunca se cachea. */
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** El documento con las confirmaciones de la invitación ya cruzadas. */
async function armar(slug: string, doc: DocPanel): Promise<DocPanel> {
  return { ...doc, invitados: mezclarConfirmaciones(doc, await listar(slug)) };
}

async function entrar(ctx: Ctx) {
  const { slug } = await ctx.params;
  const invitacion = buscarInvitacion(slug);
  if (!invitacion || (await acceso(slug)) !== "adentro") return null;
  return { slug, acento: invitacion.diseno.acento };
}

export async function GET(_: Request, ctx: Ctx) {
  const e = await entrar(ctx);
  if (!e) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await armar(e.slug, await leerPanel(e.slug, e.acento)));
}

export async function PUT(pedido: Request, ctx: Ctx) {
  const e = await entrar(ctx);
  if (!e) return Response.json({ error: "No autorizado" }, { status: 401 });

  const texto = await pedido.text();
  if (texto.length > 2_000_000) return Response.json({ error: "Demasiado grande" }, { status: 413 });

  let cuerpo: { version?: unknown; doc?: unknown };
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const previo = await leerPanel(e.slug, e.acento);
  const versionLeida = Number(cuerpo.version);
  if (!Number.isInteger(versionLeida)) return Response.json({ error: "Falta la versión" }, { status: 400 });

  const doc = sanearDoc(cuerpo.doc, previo);
  if (!doc) return Response.json({ error: "Documento inválido" }, { status: 400 });

  try {
    const guardado = await guardarPanel(e.slug, doc, versionLeida);
    return Response.json(await armar(e.slug, guardado));
  } catch (err) {
    if (err instanceof VersionVieja) {
      // Se devuelve lo último guardado para que el navegador se ponga al día.
      return Response.json({ error: "Hubo cambios desde otro dispositivo", doc: await armar(e.slug, previo) }, { status: 409 });
    }
    return Response.json({ error: "No pudimos guardar" }, { status: 500 });
  }
}
